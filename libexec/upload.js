/**
 * @file        libexec/upload.js
 *              /method/upload method for dcp-slice-httpd server
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */
'use strict';

const utils = require('../lib/utils');
const config = require('../etc/config');    
/**
 * Method entrypoint - receive content from the user and write it to disk.
 *
 * @param {object} request      The node httpserver object representing the incoming HTTP request
 * @param {object} response     The node httpserver object representing the outgoing HTTP response
 * @param {object} postData     An object representing the POST data that was sent with the HTTP request;
 *                              the query has been unescaped and turned back into raw data, with the
 *                              query parameter becoming the JS object key.
 *
 * @returns An object with { success: true } upon success, which is sent back to the uploader as 
 *          JSON data.
 */
async function upload(request, response, postData)
{
  var job         = postData.job   || utils.randomId();
  var slice       = postData.slice || utils.randomId();
  var datum       = postData.datum;
  var contentType = postData.contentType;
  var origin      = config.origin || request.headers.origin;
  var href        = `${origin}/methods/download/jobs/${job}/${slice}`;

  await utils.writeSlice(datum, job, slice, contentType)

  return { success: true, href };
}

exports.entrypoint = upload;
