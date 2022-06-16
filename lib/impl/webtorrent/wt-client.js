import { getResponse, makeHandleBase } from '../../common.js';

/**
 * @param {import('webtorrent').Instance} client
 * @return {import('../../common.js').GetStreamFunction}
 */
const makeGetStream = (client) => (req) => {
  const { url, scope } = req;

  const parts = url.slice(scope.length + 'webtorrent/'.length).split('/');
  const [infoHash] = parts;
  if (!infoHash) throw new Error('File not found');

  let [, ...filePath] = parts;
  filePath = decodeURI(filePath.join('/'));
  if (!filePath) throw new Error('File not found');

  const torrent = client.get(infoHash);
  const file = torrent?.files?.find((f) => f.path === filePath);

  const { response, range } = getResponse(req, file.name, file.length);
  const { method, destination, headers } = req;

  const stream = method === 'GET' && file.createReadStream(range);
  if (stream) {
    file.emit('stream', {
      stream,
      file,
      req: {
        method,
        headers,
        destination,
      },
    });
  }

  return {
    response,
    stream,
  };
};

/** @type {import('../../common').MessageHandler} */
export const match = (event) => {
  const { data: { scope, url } } = event;
  return url.startsWith(`${scope}webtorrent/`);
};

/**
 * @param {import('webtorrent').Instance} client
 * @param {MessageEvent<SWRequest>} event
 * @return {import('../../common').MessageHandler}
 */
export const makeHandle = (client) => {
  client.serviceWorker = navigator.serviceWorker.controller;
  const getStream = makeGetStream(client);
  return makeHandleBase(getStream);
};

export default {
  match,
  makeHandle,
};
