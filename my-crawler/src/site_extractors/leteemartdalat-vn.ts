import { CheerioAPI, Request } from 'cheerio';
import { Product } from 'schema-dts';
import memoizeOne from 'memoize-one';
import metascraper from 'metascraper';
import make_title_rule from 'metascraper-title';
import make_description_rule from 'metascraper-description';
import make_image_rule from 'metascraper-image';
import make_date_rule from 'metascraper-date';
import make_shopping_rule from '@samirrayani/metascraper-shopping';

enum SchemaTypes {
    Product = 'Product',
}

enum BusinessType {
    Ecommerce = 'ecommerce',
}

class Extractor {
    public businessType = BusinessType.Ecommerce;
    private semanticSources = {};

    constructor(private request: Request<Dictionary>, private $: CheerioAPI) {}

    public run = async () => {
        await this.gatherSemanticSources();

        const productData = this.getProductData();

        const data = {
            url: this.getUrl(),
            title: this.getTitle(),
            description: this.getDescription(),
        };

        const raw = {
            html: this.$.html(),
            text: this.$.text(),
        }

        return { ...data, ...productData, ...raw };
    }

    public gatherSemanticSources = async () => {
        await this.fromMetadata();
        this.fromJsonld(SchemaTypes.Product);
        console.log('semanticSources: ', this.semanticSources);
    }

    public fromJsonld = (type: SchemaTypes) => {
        const self = this;
        const jsonld: Product[] = [];
        this.$('script[type=application/ld+json]').each((index, el) => {
            const text = self.$(el).text();
            if (!text) {
                return;
            }

            try {
                const data = JSON.parse(text)[0];
                if (data['@type'] !== type) {
                    return;
                }
                jsonld.push(data as Product);
            } catch (e) {
                return;
            }
        });

        if (jsonld && jsonld[0]) {
            this.semanticSources['jsonld'] = jsonld[0];
        }
    }

    public fromMetadata = async () => {
        const url = this.request.url;
        const html = this.$.html();
        const rules = [
            make_title_rule(),
            make_description_rule(),
            make_image_rule(),
            make_date_rule(),
            make_shopping_rule(),
        ]

        const result = await new Promise((resolve, reject) => {
            metascraper(rules)({ html, url }).then((data) => {
                resolve(data);
            });
        })
    
        this.semanticSources['metadata'] = result;
    }

    public getDataFromSemanticWeb = (name, synonym) => {
        let names;
        if(Array.isArray(synonym)) {
            names = [ name, ...synonym ];
        } else {
            names = [ name ];
        }

        const semanticSources = Object.values(this.semanticSources);
        let value;
        for (let _name of names) {
            for (let source of semanticSources) {
                value = source[name];
                if(value) {
                    break;
                }
            }
            if(value) {
                break;
            }
        }

        return value;
    }

    public getUrl = (): string => {
        let url = this.getDataFromSemanticWeb('url');

        if (!url) {
            url = this.request.url;
        }

        return url;
    }

    public getTitle = (): string => {
        let title = this.getDataFromSemanticWeb('title');
        title = title ?? '';
        return title;
    }

    public getDescription = (): string => {
        let description = this.getDataFromSemanticWeb('description');
        description = description ?? '';
        return description;
    }

    public getImage = (): string => {
        return this.getDataFromSemanticWeb('image');
    }

    public getBrand = (): string => {
        let brand = this.getDataFromSemanticWeb('brand');

        if (!brand) {
            return '';
        }

        if (brand['@type']) {
           return brand['name'];
        }
        
        return String(brand);
    }

    public getCategory = (): string => {
        let category = this.getDataFromSemanticWeb('category');
        category ?? '';
        return category;
    }

    public getPrice = (): number | null => {
        let price;
        const jsonld = this.semanticSources['jsonld'];
        price = jsonld.offers?.price;

        if (!price) {
            price = this.getDataFromSemanticWeb('price');
        }

        price ?? null; 

        return price;
    }

    public getPriceCurrency = (): string => {
        let currency; 
        const jsonld = this.semanticSources['jsonld'];
        currency = jsonld.offers?.priceCurrency;

        if (!currency) {
            currency = this.getDataFromSemanticWeb('priceCurrency', ['currency']);
        }

        currency ?? '';

        return currency;
    }

    public getAvailability = (): number | string | null => {
        let availability = this.getDataFromSemanticWeb('availability');
        availability ?? null;
        return availability;
    }

    public getProductData = (): Product => {
        const image = this.getImage();
        const brand = this.getBrand();
        const category = this.getCategory();
        const price = this.getPrice();

        return {
            image: this.getImage(),
            brand: this.getBrand(),
            category: this.getCategory(),
            offers: {
                price: this.getPrice(),
                priceCurrency: this.getPriceCurrency(),
                availability: this.getAvailability(),
            }
        }
    }
}

export default Extractor
