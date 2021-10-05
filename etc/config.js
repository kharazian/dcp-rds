/**
 * @file        config.js
 *              Configuration module for dcp-slice-httpd. Each export is a configuration key.
 *
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */

exports.debug = false;

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

