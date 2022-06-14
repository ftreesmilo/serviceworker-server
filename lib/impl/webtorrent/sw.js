/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

/** @type {import('./sw.js').FetchMatchHandler} */
export const match = (event) => {
  const { request: { url } } = event;
  return url.startsWith(`${self.registration.scope}webtorrent/`);
};

/** @type {import('./sw.js').FetchHandler} */
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
      type: 'webtorrent',

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

export default {
  match,
  handle,
};
