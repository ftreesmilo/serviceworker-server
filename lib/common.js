import { getType } from 'mime';
import rangeParser from 'range-parser';

import { logger } from './logger.js';

const { error, trace } = logger('common');

/**
 * @typedef SWRequest
 * @property {string} url
 * @property {string} scope
 * @property {string} method
 * @property {string} destination
 * @property {Headers} headers
 */

/**
 * @typedef SWResponse
 * @property {number} status
 * @property {string} body
 * @property {Headers} headers
 */

/**
 * @param {SWRequest} req
 * @param {string} name
 * @param {number} length
 * @param {string} method
 * @param {string} destination
 * @param {string} rangeHeader
 * @returns {{ response: SWResponse, range: import('range-parser').Range }}
 */
export const getResponse = (req, name, length) => {
  const {
    method,
    destination,
    headers: {
      range: rangeHeader = '',
    },
  } = req;

  const response = {
    status: 200,
    headers: {
      // Support range-requests
      'Accept-Ranges': 'bytes',
      'Content-Type': getType(name),
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      Expires: '0',
    },
    body: method === 'HEAD' ? '' : 'STREAM',
  };

  // force the browser to download the file if if it's opened in a new tab
  if (destination === 'document') {
    response.headers['Content-Type'] = 'application/octet-stream';
    response.headers['Content-Disposition'] = 'attachment';
    response.body = 'DOWNLOAD';
  }

  // `rangeParser` returns an array of ranges, or an error code (number) if
  // there was an error parsing the range.
  let range = rangeParser(length, rangeHeader);
  if (Array.isArray(range.constructor)) {
    response.status = 206; // indicates that range-request was understood

    // no support for multi-range request, just use the first range
    range = range[0]; // eslint-disable-line prefer-destructuring

    response.headers['Content-Range'] = `bytes ${range.start}-${range.end}/${length}`;
    response.headers['Content-Length'] = `${range.end - range.start + 1}`;
  } else {
    if (trace.enabled) trace('got error parsing range: %s', range);
    range = {};

    response.headers['Content-Length'] = length;
  }

  return {
    response,
    range,
  };
};

/**
 * @callback GetStreamFunction
 * @param {MessageEvent<SWRequest>} getStream
 * @return {{ response: SWResponse, stream: ReadableStream}}
 */

/**
 * @callback MessageHandler
 * @param {MessageEvent<SWRequest>} event
 */

/**
 * @param {GetStreamFunction} getStream
 * @return {MessageHandler}
 */
export const makeHandleBase = (getStream) => (event) => {
  const { data, ports } = event;
  const { url } = data;
  if (!url) return;

  const [port] = ports;
  const { response, stream } = getStream(event.data);
  const iter = stream[Symbol.asyncIterator]();

  const cleanup = () => {
    port.onmessage = null;
    if (stream) stream.destroy();
  };

  port.onmessage = async (msg) => {
    if (msg.data) {
      let chunk;
      try {
        chunk = (await iter.next()).value;
      } catch (e) {
        error(e);
      }
      port.postMessage(chunk);
      if (!chunk) cleanup();
    } else {
      cleanup();
    }
  };

  port.postMessage(response);
};

export default {
  getResponse,
  makeHandleBase,
};
