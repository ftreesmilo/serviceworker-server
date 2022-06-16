/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

/** @type {import('../../worker.js').FetchMatchHandler} */
export const match = (event) => {
  const { request: { url } } = event;
  return url.startsWith(`${self.registration.scope}webtorrent/`);
};

export default {
  match,
};
