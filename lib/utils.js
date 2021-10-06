/**
 * @file        lib/utils.js
 *              Misc utility functions for dcp-slice-httpd server
 *
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */

const nanoid = require('nanoid').nanoid;

exports.randomId = function utils$$randomId()
{
  return nanoid(32);
}
