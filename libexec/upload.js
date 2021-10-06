/**
 * @file        libexec/upload.js
 *              /method/upload method for dcp-slice-httpd server
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */

const utils = require('../lib/utils');
    
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
function upload(request, response, postData)
{
  let job         = postData.job   || utils.randomId();
  let slice       = postData.slice || utils.randomId();
  let datum       = postData.datum;
  let contentType = postData.contentType;
  
  debugger;
  return { success: true, datum: typeof datum };
}

exports.entrypoint = upload;
