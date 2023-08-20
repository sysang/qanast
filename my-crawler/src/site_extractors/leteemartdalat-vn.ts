import { CheerioAPI } from 'cheerio';
import { Request } from 'crawlee';
import type { Dictionary } from '@crawlee/types';
import { Product } from 'schema-dts';
import metascraper from 'metascraper';
import make_title_rule from 'metascraper-title';
import make_description_rule from 'metascraper-description';
import make_image_rule from 'metascraper-image';
import make_date_rule from 'metascraper-date';
// import make_shopping_rule from '@samirrayani/metascraper-shopping';

import { parseHtml } from '../grpc_services/newspaper';
import { removeBreaklineCharacters } from '../text_utils';
import { hashText } from '../text_utils';

enum SchemaTypes {
    Product = 'Product',
}

enum BusinessType {
    Ecommerce = 'ecommerce',
}

class Extractor {
    public businessType = BusinessType.Ecommerce;
    private semanticSources = {};

    // @ts-ignore
    constructor(private request: Request<Dictionary>, private $: CheerioAPI) {}

    public getData = async (): Promise<any> => {
        await this.gatherSemanticSources();

        const productData = this.getProductData();

        const data = {
            url: this.getUrl(),
            title: this.getTitle().toLowerCase(),
            description: this.getDescription().toLowerCase(),
        };

        this.$('head').remove();
        this.$('header').remove();
        this.$('footer').remove();
        this.$('script').remove();
        this.$('.product-details--side').remove();
        const html = this.$.html();
        const parsed = await parseHtml(html);
        // @ts-ignore
        let content = removeBreaklineCharacters(parsed.content);
        content = content.toLowerCase();

        const raw = {
            content: content,
            hashed: hashText(content),
        }

        return { ...data, ...productData, ...raw };
    }

    public gatherSemanticSources = async () => {
        await this.fromMetadata();
        this.fromJsonld(SchemaTypes.Product);
    }

    public fromJsonld = (type: SchemaTypes) => {
        const self = this;
        const jsonld: Product[] = [];
        // @ts-ignore
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
            // @ts-ignore
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
            // make_shopping_rule(),
        ]

        // @ts-ignore
        const result = await new Promise((resolve, reject) => {
            metascraper(rules)({ html, url }).then((data) => {
                resolve(data);
            });
        })
    
        // @ts-ignore
        this.semanticSources['metadata'] = result;
    }

    public getDataFromSemanticWeb = (name: string, synonym?: string[]): any => {
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
                // @ts-ignore
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
        // @ts-ignore
        const jsonld = this.semanticSources['jsonld'];
        price = jsonld?.offers?.price;

        if (!price) {
            price = this.getDataFromSemanticWeb('price');
        }

        price ?? null; 

        return price;
    }

    public getPriceCurrency = (): string => {
        let currency; 
        // @ts-ignore
        const jsonld = this.semanticSources['jsonld'];
        currency = jsonld?.offers?.priceCurrency;

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
        return {
            image: this.getImage(),
            brand: this.getBrand(),
            category: this.getCategory(),
            // @ts-ignore
            offers: {
                price: this.getPrice(),
                priceCurrency: this.getPriceCurrency(),
                availability: this.getAvailability(),
            }
        }
    }
}

export default Extractor
