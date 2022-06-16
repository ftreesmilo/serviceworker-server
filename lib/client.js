/**
 * @callback MatchHandler
 * @param {MessageEvent<import('./lib/common.js').SWRequest>} event
 * @return {boolean}
 */

/**
 * @typedef ClientServeOptions
 * @property {MatchHandler} match
 * @property {import("./lib/common").MessageHandler} handle
 */

/** @param {ClientServeOptions} param0 */
export const clientserve = ({ match, handle }) => {
  if (!match) throw new Error('Must specify match function.');
  if (!handle) throw new Error('Must specify handle function.');

  navigator.serviceWorker.addEventListener('message', (event) => (match(event) && handle(event)));
};

export default {
  clientserve,
};
