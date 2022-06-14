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
 * @callback FetchHandler
 * @param {FetchEvent} event
 * @return {Response=}
 */

/**
 * @typedef SWServeOptions
 * @property {FetchMatchHandler} match
 * @property {FetchHandler} handle
 */

/**
 * @param {SWServeOptions} param0
 */
export const swserve = ({ match, handle }) => {
  if (!match) throw new Error('Must specify match function.');
  if (!handle) throw new Error('Must specify handle function.');

  addEventListener('fetch', (event) => {
    if (match(event)) {
      event.respondWith(handle(event));
    }
  });
};

export default {
  swserve,
};
