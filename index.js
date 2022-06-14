import * as sw from './lib/sw.js';
import * as client from './lib/client.js';

export const { swserve } = sw;
export const { clientserve } = client;

export default {
  clientserve,
  swserve,
};
