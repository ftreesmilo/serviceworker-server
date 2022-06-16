/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

import { logger } from './logger.js';

const { trace } = logger('worker');

/**
 * @typedef FetchEventInterface
 * @property {Request} request
 * @property {(Response) => void} respondWith
 */

/**
 * @typedef {Event & FetchEventInterface} FetchEvent
 */

/**
 * @callback FetchMatchHandler
 * @param {FetchEvent} event
 * @return {boolean}
 */

/**
 * @typedef SWServeOptions
 * @property {FetchMatchHandler} match
 */

const scope = self?.registration?.scope;
export const keepAliveURL = scope ? new URL('./sw-server-keepalive', scope) : undefined;

let initialized = false;
const init = () => {
  if (!initialized) {
    initialized = true;
    if (trace.enabled) trace('Keepalive system initialized.');

    addEventListener('fetch', (event) => {
      if (event.request.url === keepAliveURL.href) {
        event.respondWith(new Response());
      }
    });
  }
};

export const handle = async (event) => {
  const { request: {
    url,
    method,
    headers,
    destination,
  } } = event;

  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  /** @type {[{ body: string }, MessageChannel]} */
  const [data, channel] = await Promise.race(clients.map((client) => new Promise((resolve) => {
    const messageChannel = new MessageChannel();

    const { port1, port2 } = messageChannel;
    port1.onmessage = (e) => resolve([e.data, messageChannel]);

    client.postMessage({
      url,
      method,
      headers: { ...headers.entries() },
      scope: self.registration.scope,
      destination,
    }, [port2]);
  })));

  if (data.body === 'STREAM' || data.body === 'DOWNLOAD') {
    return new Response(new ReadableStream({
      async pull(controller) {
        return new Promise((resolve) => {
          /** @param {MessageEvent<Uint8Array>} e */
          channel.port1.onmessage = (e) => {
            if (e.data) {
              controller.enqueue(e.data);
            } else {
              controller.close(); // stream ended
              channel.port1.onmessage = null;
            }
            resolve();
          };

          channel.port1.postMessage(true); // send a pull request
        });
      },
      cancel() {
        channel.port1.postMessage(false); // send a cancel request
      },
    }), data);
  }

  return new Response(data.body, data);
};

/**
 * @param {SWServeOptions} param0
 */
export const swserve = ({ match }) => {
  if (!match) throw new Error('Must specify match function.');

  init();
  addEventListener('fetch', (event) => {
    if (match(event)) {
      event.respondWith(handle(event));
    }
  });
};

export default {
  swserve,
  keepAliveURL,
};
