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

class Extractor {
    public businessType = 'ecommerce'
    private semanticSources = [];

    constructor(private request: Request<Dictionary>, private $: CheerioAPI) {}

    public run = async () => {
        this.metascraperData = await this.fromMetadata();
        this.jsonldData = this.fromJsonld(SchemaTypes.Product);

        const productData = this.getProductData();
        console.log('metascraperData: ', this.metascraperData);

        const data = {
            url: this.getUrl(),
            title: this.getTitle(),
            description: this.getDescription(),
        }

        return { ...data, ...productData }
    }

    public gatherSemanticSources = () => {
        this.fromMetadata();
        this.fromJsonld();
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
            metascraper(rules)({ html,  url }).then((data) => {
                resolve(data)
            });
        })
    
        this.semanticSources.push(result);
    }

    public getDataFromSemanticWeb = (name, synonym) => {
        let names;
        if(Array.isArray(synonym)) {
            names = [ name, ...synonym ]
        } else {
            names = [ name ]
        }

        let value;
        for (let _name of names) {
            for (let source of this.semanticSources) {
                value = source[name];
                if(value) {
                    break
                }
            }
            if(value) {
                break
            }
        }

        return value;
    }

    public getUrl = (): string => {
        let url = this.getDataFromSemanticWeb('url');

        if (!url) {
            url = this.request.url
        }

        return url
    }

    public getTitle = (): string => {
        return this.getDataFromSemanticWeb('title');
    }

    public getDescription = (): string => {
        return this.getDataFromSemanticWeb('description');
    }

    public getImage = (): string => {
        return this.getDataFromSemanticWeb('image');
    }

    public getBrand = (): string => {
        return this.getDataFromSemanticWeb('brand');
    }

    public getCategory = (): string => {
        return this.getDataFromSemanticWeb('category');
    }

    public getProductData = (): Product => {
        const image = this.getImage();
        const brand = this.getBrand();
        const category = this.getCategory();

        return {
            image,
            brand,
            category,
        }
    }

    public fromJsonld = (type: SchemaTypes) => {
        const self = this;
        const jsonld: Product[] = [];
        self.$('script[type=application/ld+json]').each((index, el) => {
            const text = self.$(el).text()
            if (!text) {
                return;
            }

            try {
                const data = JSON.parse(text)[0];
                if (data['@type'] !== type) {
                    return
                }
                jsonld.push(data as Product)
            } catch {
                return;
            }
        })

        if (jsonld && jsonld[0]) {
            this.semanticSources.push(jsonld[0])
        }
    }
}

export default Extractor
