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
 * @callback FetchHandler
 * @param {FetchEvent} event
 * @return {Response=}
 */

/**
 * @typedef SWServeOptions
 * @property {FetchMatchHandler} match
 * @property {FetchHandler} handle
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

/**
 * @param {SWServeOptions} param0
 */
export const swserve = ({ match, handle }) => {
  if (!match) throw new Error('Must specify match function.');
  if (!handle) throw new Error('Must specify handle function.');

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
