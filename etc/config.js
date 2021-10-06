/**
 * @file        config.js
 *              Configuration module for dcp-slice-httpd. Each export is a configuration key.
 *
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */

const path = require('path');

exports.debug      = false;
exports.mode       = 'release';
exports.listen     = new URL('http://localhost:3521/');
exports.storageDir = path.resolve(path.dirname(require.main.filename), '../storage');

/************ load in a local config, if present, which can override properties in this file ************/
try
{
  const lc = require('./local-config.js');
  Object.assign(exports, lc);
}
catch (error)
{
  if (error.code !== 'MODULE_NOT_FOUND')
    throw error;
}
