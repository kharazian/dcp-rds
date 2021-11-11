/**
 * @file        config.js
 *              Configuration module for dcp-rds-httpd. Each export is a configuration key.
 *
 *              *** DO NOT EDIT ***
 *              To change the configuration, override the same-named exports in ${prefix}/etc/dcp-rds-config.js
 * 
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */

const path = require('path');
const installPrefix  = path.resolve(path.dirname(process.argv[1]), '..');
const overlay = require('../lib/overlay').overlay;

exports.debug           = false;
exports.mode            = 'release';
exports.listen          = new URL('http://localhost:3521/methods');
exports.location        = exports.listen;
exports.storageDir      = path.resolve(installPrefix || '../', 'storage');

/* load in a local config, if present, which can override properties in this file */
overlay(exports, path.join(installPrefix, 'etc', 'dcp-rds-config'));

