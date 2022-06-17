/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

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

export const handle = async (event) => {
  const { request: {
    url,
    method,
    headers,
    destination,
  } } = event;

  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  /** @type {import('serviceworker-server/lib/common.js').SWResponse} */
  const data = await Promise.race(clients.map((client) => new Promise((resolve) => {
    const messageChannel = new MessageChannel();

    const { port1, port2 } = messageChannel;
    port1.onmessage = (e) => {
      port1.onmessage = undefined;
      resolve(e.data);
    };

    client.postMessage({
      url,
      method,
      headers: { ...headers.entries() },
      scope: self.registration.scope,
      destination,
    }, [port2]);
  })));

  return new Response(data.stream, { headers: data.headers, status: data.status });
};

/**
 * @param {SWServeOptions} param0
 */
export const swserve = ({ match }) => {
  if (!match) throw new Error('Must specify match function.');

  addEventListener('fetch', (event) => {
    if (match(event)) {
      event.respondWith(handle(event));
    }
  });
};

export default {
  swserve,
};
