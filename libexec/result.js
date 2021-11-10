/**
 * @file        libexec/result.js
 *              /method/result method for dcp-rds-httpd server for
 *              temporary handling of JSON-formatted remote results
 * @author      Chris M, chris@kingsds.network
 * @date        Nov 2021
 */
'use strict';

const utils = require('../lib/utils');
const config = require('../etc/config');    

async function result(request, response, query)
{
  var jobId       = query.jobId   || utils.randomId();
  jobId = JSON.parse(jobId);
  var element     = query.element || query['slice'] || utils.randomId();
  element = JSON.parse(element);
  var elementType = query.elementType || '"result"';
  elementType = JSON.parse(elementType);
  var content     = query.content || query[elementType] || null;
  var contentType = query.contentType;
  contentType = JSON.parse(contentType);
  var location = utils.getLocation(request);
  var href        = `${location.protocol}//${location.host}/methods/download/jobs/${jobId}/${elementType}/${element}`;

  await utils.storeContent(content, contentType, jobId, elementType, element);

  return { success: true, href };
}

exports.entrypoint = result;
