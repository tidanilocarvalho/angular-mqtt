import { Component, OnInit } from '@angular/core';

import { MQTTService } from '../../app/mqtt/mqtt.service';
import { Product } from './product.model';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  providers: [MQTTService]
})
export class ProductComponent implements OnInit {
  name: string;
  value: number;
  forSale: boolean;

  newProduct: Product;
  products: Product[] = [];

  constructor(private mqtt: MQTTService) {
    this.mqtt
      .tryConnect()
      .then(this.onConnect)
      .catch(this.onError);
   }

  ngOnInit() {}

  public onConnect = () => {
    const forSaleObservable = this.mqtt.geProducts();

    forSaleObservable.subscribe((payload: string) => {
      this.newProduct = JSON.parse(payload);
      this.addToList();
    });
  }

  public onError = () => {
    console.error('Error');
  }

  isAddButtonEnabled() {
    return !this.name || !this.value;
  }

  onAddProduct() {
    this.newProduct = new Product(
      this.name,
      this.value,
      this.forSale
    );

    this.addToList();
    this.publishForSale();
    this.resetValues();
  }

  addToList() {
    this.products.push(this.newProduct);
  }

  publishForSale() {
    if (this.forSale) {
      this.mqtt.publish(JSON.stringify(this.newProduct));
    }
  }

  resetValues() {
    this.name = null;
    this.value = null;
    this.forSale = false;
    this.newProduct = null;
  }
}
