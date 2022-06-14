/* eslint-disable no-console */

import debug from 'debug';

/** @param {string} name */
export const logger = (name) => {
  const error = debug(`sw-server:${name}:error`);
  error.log = console.error.bind(console);

  const warn = debug(`sw-server:${name}:warn`);
  warn.log = console.warn.bind(console);

  const log = debug(`sw-server:${name}:log`);

  const trace = debug(`sw-server:${name}:trace`);
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
