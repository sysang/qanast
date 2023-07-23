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
    private metadata;
    private jsonldData;

    constructor(private request: Request<Dictionary>, private $: CheerioAPI) {}

    public run = async () => {
        this.metadata = await this.getMetadata();
        this.jsonldData = this.fromJsonld(SchemaTypes.Product);

        return {
            url: this.getUrl(),
            title: this.getTitle(),
            description: this.getDescription(),
            image: this.getImage(),
        }
    }

    public getMetadata = async () => {
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
    
        return result;
    }

    public getUrl = (): string => {
        let url = this.metadata['url'];

        if (!url) {
            url = this.request.url
        }

        return url
    }

    public getTitle = (): string => {
        let title = this.metadata['title'];
        return title;
    }

    public getDescription = (): string => {
        let description = this.metadata['description'];
        return description;
    }

    public getImage = (): string => {
        let image = this.metadata['image'];
        return image;
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

        return jsonld[0]
    }
}

export default Extractor
