import { Component, OnInit } from '@angular/core';
import { Packet } from 'mqtt';

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
  productsForSale: Product[] = [];

  constructor(private mqtt: MQTTService) {
    this.mqtt
      .tryConnect()
      .then(this.onConnect)
      .catch(this.onError);
   }

  ngOnInit() {}

  public onConnect = () => {
    const forSaleObservable = this.mqtt.payloadSubject;

    forSaleObservable.subscribe((message: Packet) => {
      this.newProduct = JSON.parse(message.toString());
      this.productsForSale.push(this.newProduct);
    });
  }

  public onError = () => {
    console.error('Error');
  }

  isAddButtonEnabled() {
    return !this.name || !this.value;
  }

  onClearProductList() {
    this.products = [];
    this.productsForSale = [];
    this.resetValues();
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
    if (!this.forSale) {
      this.products.push(this.newProduct);
    }
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
