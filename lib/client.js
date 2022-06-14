/**
 * @callback MatchHandler
 * @param {MessageEvent} event
 * @return {boolean}
 */

/**
 * @typedef ClientServeOptions
 * @property {MatchHandler} match
 * @property {import("./common").MessageHandler} handle
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
