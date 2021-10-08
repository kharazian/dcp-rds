/**
 * @file        config.js
 *              Configuration module for dcp-rds-httpd. Each export is a configuration key.
 *
 *              *** DO NOT EDIT ***
 *              To change the configuration, override the same-named exports in ./local-config.js
 * 
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */

const path = require('path');

exports.debug           = false;
exports.mode            = 'release';
exports.listen          = new URL('http://localhost:3521/methods');
exports.location        = exports.listen;
exports.storageDir      = path.resolve(path.dirname(require.main.filename), '../storage');

/************ load in a local config, if present, which can override properties in this file ************/
try
{
  Object.assign(exports, require('./local-config.js'));
}
catch (error)
{
  if (error.code !== 'MODULE_NOT_FOUND')
    throw error;
}
