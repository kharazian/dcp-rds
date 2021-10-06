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
 * Method entrypoint - receive content from the request and write it to disk.
 *
 * @param {object} request      The node httpserver object representing the incoming HTTP request
 * @param {object} response     The node httpserver object representing the outgoing HTTP response
 * @param {object} query        An object representing the POST data that was sent with the HTTP request;
 *                              the query has been unescaped and turned back into raw data, with the
 *                              query parameter becoming the JS object key. Possible post values are:
 *                                      job             unique identifier for the job
 *                                      slice           unique identifier for the slice
 *                                      datum           input set datum for this slice
 *                                      contentType     MIME type of the uploaded content
 *
 *
 * @returns {object} An object, which is sent back with the response in JSON, with the following properties:
 *                      success {boolean}       true if successful, false if error
 *                      href    {string}        a full URL which gives the path from which this datum may be downloaded
 *                      error   {object}        optional instance of Error. If present, may have also have non-standard 
 *                                              stack and code properties.
 */
async function upload(request, response, query)
{
  var job         = query.job   || utils.randomId();
  var slice       = query.slice || utils.randomId();
  var datum       = query.datum;
  var contentType = query.contentType;
  var origin      = config.origin || utils.getRequestUrl(request).origin;
  var href        = `${origin}/methods/download/jobs/${job}/${slice}`;

  if (!Object.hasOwnProperty.call(query, 'datum'))
    throw new Error('query missing datum');
  
  await utils.writeSlice(datum, job, slice, contentType)

  return { success: true, href };
}

exports.entrypoint = upload;
