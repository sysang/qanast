"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metascraper_1 = __importDefault(require("metascraper"));
const metascraper_title_1 = __importDefault(require("metascraper-title"));
const metascraper_description_1 = __importDefault(require("metascraper-description"));
const metascraper_image_1 = __importDefault(require("metascraper-image"));
const metascraper_date_1 = __importDefault(require("metascraper-date"));
// import make_shopping_rule from '@samirrayani/metascraper-shopping';
const newspaper_1 = require("../grpc_services/newspaper");
const text_utils_1 = require("../text_utils");
const text_utils_2 = require("../text_utils");
var SchemaTypes;
(function (SchemaTypes) {
    SchemaTypes["Product"] = "Product";
})(SchemaTypes || (SchemaTypes = {}));
var BusinessType;
(function (BusinessType) {
    BusinessType["Ecommerce"] = "ecommerce";
})(BusinessType || (BusinessType = {}));
class Extractor {
    // @ts-ignore
    constructor(request, $) {
        this.request = request;
        this.$ = $;
        this.businessType = BusinessType.Ecommerce;
        this.semanticSources = {};
        this.getData = async () => {
            await this.gatherSemanticSources();
            const productData = this.getProductData();
            const data = {
                url: this.getUrl().toLowerCase(),
                title: this.getTitle().toLowerCase(),
                description: this.getDescription().toLowerCase(),
            };
            this.$('head').remove();
            this.$('header').remove();
            this.$('footer').remove();
            this.$('script').remove();
            this.$('.product-details--side').remove();
            const html = this.$.html();
            const parsed = await (0, newspaper_1.parseHtml)(html);
            // @ts-ignore
            let content = (0, text_utils_1.removeBreaklineCharacters)(parsed.content);
            content = content.toLowerCase();
            const raw = {
                content: content,
                hashed: (0, text_utils_2.hashText)(content),
            };
            return { ...data, ...productData, ...raw };
        };
        this.gatherSemanticSources = async () => {
            await this.fromMetadata();
            this.fromJsonld(SchemaTypes.Product);
        };
        this.fromJsonld = (type) => {
            const self = this;
            const jsonld = [];
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
                    jsonld.push(data);
                }
                catch (e) {
                    return;
                }
            });
            if (jsonld && jsonld[0]) {
                // @ts-ignore
                this.semanticSources['jsonld'] = jsonld[0];
            }
        };
        this.fromMetadata = async () => {
            const url = this.request.url;
            const html = this.$.html();
            const rules = [
                (0, metascraper_title_1.default)(),
                (0, metascraper_description_1.default)(),
                (0, metascraper_image_1.default)(),
                (0, metascraper_date_1.default)(),
                // make_shopping_rule(),
            ];
            // @ts-ignore
            const result = await new Promise((resolve, reject) => {
                (0, metascraper_1.default)(rules)({ html, url }).then((data) => {
                    resolve(data);
                });
            });
            // @ts-ignore
            this.semanticSources['metadata'] = result;
        };
        this.getDataFromSemanticWeb = (name, synonym) => {
            let names;
            if (Array.isArray(synonym)) {
                names = [name, ...synonym];
            }
            else {
                names = [name];
            }
            const semanticSources = Object.values(this.semanticSources);
            let value;
            for (let _name of names) {
                for (let source of semanticSources) {
                    // @ts-ignore
                    value = source[name];
                    if (value) {
                        break;
                    }
                }
                if (value) {
                    break;
                }
            }
            return value;
        };
        this.getUrl = () => {
            let url = this.getDataFromSemanticWeb('url');
            if (!url) {
                url = this.request.url;
            }
            return url;
        };
        this.getTitle = () => {
            let title = this.getDataFromSemanticWeb('title');
            title = title ?? '';
            return title;
        };
        this.getDescription = () => {
            let description = this.getDataFromSemanticWeb('description');
            description = description ?? '';
            return description;
        };
        this.getImage = () => {
            return this.getDataFromSemanticWeb('image');
        };
        this.getBrand = () => {
            let brand = this.getDataFromSemanticWeb('brand');
            if (!brand) {
                return '';
            }
            if (brand['@type']) {
                return brand['name'];
            }
            return String(brand);
        };
        this.getCategory = () => {
            let category = this.getDataFromSemanticWeb('category');
            category ?? '';
            return category;
        };
        this.getPrice = () => {
            let price;
            // @ts-ignore
            const jsonld = this.semanticSources['jsonld'];
            price = jsonld?.offers?.price;
            if (!price) {
                price = this.getDataFromSemanticWeb('price');
            }
            price ?? null;
            return price;
        };
        this.getPriceCurrency = () => {
            let currency;
            // @ts-ignore
            const jsonld = this.semanticSources['jsonld'];
            currency = jsonld?.offers?.priceCurrency;
            if (!currency) {
                currency = this.getDataFromSemanticWeb('priceCurrency', ['currency']);
            }
            currency ?? '';
            return currency;
        };
        this.getAvailability = () => {
            let availability = this.getDataFromSemanticWeb('availability');
            availability ?? null;
            return availability;
        };
        this.getProductData = () => {
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
            };
        };
    }
}
exports.default = Extractor;
//# sourceMappingURL=leteemartdalat-vn.js.map