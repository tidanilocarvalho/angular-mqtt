import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import * as mqtt from '../../vendor/mqtt';

@Injectable()
export class MQTTService {
  private client: mqtt.Client;
  private resolvePromise: (...args: any[]) => void;
  private topic = 'inatel/tipofweek/product/forsale';

  public payloadSubject: Subject<mqtt.Packet>;

  public constructor() {
    this.payloadSubject = new Subject<mqtt.Packet>();
  }

  public tryConnect(): Promise<{}> {
    if (this.client === null) {
      throw Error('Client not configured!');
    }
    const options: mqtt.IClientOptions = {
      keepalive: 10,
      reconnectPeriod: 10000,
      clientId: 'clientId_' + Math.floor(Math.random() * 65535)
    };

    const url = 'ws://test.mosquitto.org:8080/ws';

    this.client = mqtt.connect(url, options);

    this.client.addListener('connect', this.onConnect);
    this.client.addListener('message', this.onMessage);
    this.client.addListener('offline', this.onError);
    this.client.addListener('error', this.onError);

    return new Promise(
      (resolve, reject) => this.resolvePromise = resolve
    );
  }

  public publish(message?: string) {
    this.client.publish(this.topic, message);
  }

  public subscribe(): void {
    this.client.subscribe(this.topic);
  }

  public onConnect = () => {
    this.subscribe();
    this.resolvePromise();
    this.resolvePromise = null;
  }

  public onError = (error: any) => {
    console.error('onError');
    console.error(error);
  }

  public onMessage = (...args: any[]) => {
    // const topic = args[0];
    const payload = args[1];
    // const packet: mqtt.Packet = args[2];

    if (payload.toString()) {
      this.payloadSubject.next(payload);
      console.log('Receiving: ' + payload.toString());
    }
  }
}
