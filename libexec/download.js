/**
 * @file        libexec/download.js
 *              /method/download method for dcp-slice-httpd server
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */
'use strict';

const utils  = require('../lib/utils');
const config = require('../etc/config');

const { Error } = require('../lib/error');
const pathnameReEsc = config.location.pathname.replace(/([.])/g, '\\$1');
const rUrlComponentsRE = new RegExp(`(^${pathnameReEsc}/download/)([a-z]*)/([^/]*)/([^/]*)/([^/]*)`);

/**
 * Method entrypoint - retrieve content from the disk and send out via the response.
 *
 * @param {object} request      The node httpserver object representing the incoming HTTP request
 * @param {object} response     The node httpserver object representing the outgoing HTTP response
 * @param {object} query        An object representing the GET or POST data that was sent with the HTTP 
 *                              request; the query has been unescaped and turned back into raw data, with 
 *                              the query parameter becoming the JS object key. Possible post values are:
 *                              query parameter becoming the JS object key. Possible post values are:
 *                                      job             unique identifier for the job
 *                                      element         unique identifier for the element
 *                                      elementType     the type of element (eg slice, argument, result)
 *
 * @returns {object} An object, which is sent back with the response in JSON, with the following properties:
 *                      success {boolean}       true if successful, false if error
 *                      href    {string}        a full URL which gives the path from which this datum may be downloaded
 *                      error   {object}        optional instance of Error. If present, may have also have non-standard 
 *                                              stack and code properties.
 */
async function download(request, response, query)
{
  var rUrl = utils.getRequestUrl(request);
  var rUrlComponents = rUrl.pathname.match(rUrlComponentsRE);

  if (!rUrlComponents || rUrlComponents.length !== 6)
    throw new Error(`Could not parse URL components of ${rUrl && rUrl.href}`, 'BAD_REQUEST_URL');
  
  var job         = decodeURI(rUrlComponents[3]);
  var elementType = decodeURI(rUrlComponents[4]);
  var element     = decodeURI(rUrlComponents[5]);

  if (rUrlComponents[2] !== 'jobs')
    throw new Error(`invalid download type '${rUrlComponents[2]}'`);

  utils.sendContent(response, job, 'slice', element);
  return false;
}

exports.entrypoint = download;
