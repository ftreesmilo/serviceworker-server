/* eslint-disable no-console */

import debug from 'debug';

/** @param {string} name */
export const logger = (name) => {
  const error = debug(`serviceworker-server:${name}:error`);
  error.log = console.error.bind(console);

  const warn = debug(`serviceworker-server:${name}:warn`);
  warn.log = console.warn.bind(console);

  const log = debug(`serviceworker-server:${name}:log`);

  const trace = debug(`serviceworker-server:${name}:trace`);
  trace.log = console.trace.bind(console);

  return {
    error,
    warn,
    log,
    trace,
  };
};

export default {
  logger,
};
