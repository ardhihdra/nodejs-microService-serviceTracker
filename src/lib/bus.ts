import { connect, Client } from "nats";

export let bus: Client;

export function connectToBus(): Promise<any> {
  bus = connect({ json: true });
  return new Promise((resolve, reject) => {
    bus.once('connect', () => {
      console.log('connected to message bus');
      resolve();
    });
    bus.once('error', () => {
      reject();
    });
  });
}

