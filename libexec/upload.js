/**
 * @file        libexec/upload.js
 *              /method/upload method for dcp-rds-httpd server
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
 *                                      element         unique identifier for the element
 *                                      elementType     the type of element (eg slice, argument, result)
 *                                      content         content of this element
 *                                      contentType     MIME type of the uploaded content
 *
 * @returns {object} An object, which is sent back with the response in JSON, with the following properties:
 *                      success {boolean}       true if successful, false if error
 *                      href    {string}        a full URL which gives the path from which this content may be downloaded
 *                      error   {object}        optional instance of Error. If present, may have also have non-standard 
 *                                              stack and code properties.
 */
async function upload(request, response, query)
{
  var job         = query.job     || utils.randomId();
  var element     = query.element || utils.randomId();
  var elementType = query.elementType;
  var content     = query.content;
  var contentType = query.contentType;
  var location    = utils.getLocation(request);
  var methodPath  = location.pathname.replace(/\/upload.*$/, '');
  var href        = `${location.protocol}//${location.host}${methodPath}/download/jobs/${job}/${elementType}/${element}`;

  //console.log(`\ndcp-rds:utils:upload query ${utils.stringify(query)}\n`);
  if (!Object.hasOwnProperty.call(query, 'content'))
    throw new Error('query missing content');

  if (!elementType)
    throw new Error('Query missing elementType');
  
  await utils.storeContent(content, contentType, job, elementType, element);

  return { success: true, href };
}

exports.entrypoint = upload;
