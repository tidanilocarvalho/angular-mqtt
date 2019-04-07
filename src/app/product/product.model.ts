export class Product {
    name: string;
    value: number;
    forSale: boolean;

    constructor(name: string, value: number, forSale: boolean) {
        this.name = name;
        this.value = value;
        this.forSale = forSale;
    }
}
