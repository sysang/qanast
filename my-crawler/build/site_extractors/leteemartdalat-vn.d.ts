import { CheerioAPI } from 'cheerio';
import { Request } from 'crawlee';
import type { Dictionary } from '@crawlee/types';
import { Product } from 'schema-dts';
declare enum SchemaTypes {
    Product = "Product"
}
declare enum BusinessType {
    Ecommerce = "ecommerce"
}
declare class Extractor {
    private request;
    private $;
    businessType: BusinessType;
    private semanticSources;
    constructor(request: Request<Dictionary>, $: CheerioAPI);
    getData: () => Promise<any>;
    gatherSemanticSources: () => Promise<void>;
    fromJsonld: (type: SchemaTypes) => void;
    fromMetadata: () => Promise<void>;
    getDataFromSemanticWeb: (name: string, synonym?: string[]) => any;
    getUrl: () => string;
    getTitle: () => string;
    getDescription: () => string;
    getImage: () => string;
    getBrand: () => string;
    getCategory: () => string;
    getPrice: () => number | null;
    getPriceCurrency: () => string;
    getAvailability: () => number | string | null;
    getProductData: () => Product;
}
export default Extractor;
