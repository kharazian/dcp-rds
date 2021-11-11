/**
 * @file        lib/utils.js
 *              Misc utility functions for dcp-rds-httpd server
 *
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */

const path   = require('path');
const fs     = require('fs');
const nanoid = require('nanoid');
const config = require('../etc/config');

const busyFiles = {};
const jobsDir = path.join(config.storageDir, 'jobs');

/**
 * Generate a unique identifier
 * @return {string}
 */
exports.randomId = function utils$$randomId()
{
  const randomId = utils$$randomId;
  
  if (!randomId.gen)
    randomId.gen = nanoid.customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 32);

  return randomId.gen();
}

/**
 * Write content and metadata (content-type) to disk.
 *
 * Re-uploading content will cause it to get overwritten. Content appears atomically
 * on the filesystem. 
 *
 * @param {Buffer | string}     content         The content to store. A buffer will be written to disk as
 *                                              raw, uninterpreted bytes. A string will be converted
 *                                              to utf-8 during the write.
 * @param {string}              contentType     The MIME type of the content; used eventually by
 *                                              the worker to figure out/if the data should be
 *                                              deserialized and what JS type it will become.
 * @param {string}              job             A unique identifier for the job
 * @param {string}              elementType     The kind of content being uploaded (eg slice, result, argument...)
 * @param {string}              element       A unique identifier for the resource within the job (eg slice number)
 */
exports.storeContent = async function utils$$storeContent(content, contentType, job, elementType, element)
{
  job         = encodeURI(job);
  elementType = encodeURI(elementType);
  element     = encodeURI(element);
  
  const dir = path.join(jobsDir, job, elementType, element);
  const tmp = path.join(dir, Date.now() + 'content.tmp.' + process.pid);

  if (!dir.startsWith(jobsDir))
    throw new Error('Invalid pathname');
  
  if (busyFiles[tmp])
    throw new Error('Already uploading this file!');
  
  try
  {
    busyFiles[tmp] = true;
    fs.mkdirSync(dir, { recursive: true });
    await fs.promises.writeFile(tmp, content, typeof content === 'string' ? 'utf-8' : {});
    fs.renameSync(tmp, path.join(dir, 'content'));
    fs.writeFileSync(path.join(dir, 'content-type'), contentType, 'utf-8');
  }
  finally
  {
    delete busyFiles[tmp];
  }
}


/** Inner function - handles 404 but not 5xx */
exports.sendFile = function utils$$sendFile(response, contentType, filenameStub)
{
  var filename = path.join(config.storageDir, filenameStub);
  var headers, stream;

  if (!filename.startsWith(jobsDir))
    throw new Error('Invalid pathname');

  if (!fs.existsSync(filename))
  {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('404 - File not found: ' + filenameStub);
    return;
  }

  headers = {
    'Content-Type':   contentType,
    'Content-Length': fs.statSync(filename).size
  };

  if (!contentType.toString('utf-8').startsWith('text/') && contentType !== 'application/json')
    headers['Content-Disposition'] = 'attachment; filename=' + filenameStub.replace(/\//g, '-');

  console.log('Sending', filename);
  
  response.writeHead(200, headers);

  stream = fs.createReadStream(filename, {encoding: 'binary'});
  //logChunks(stream);
  stream.pipe(response);
}

/**
 * Read content and metadata (content-type) from disk and send it as the response to an HTTP request.
 *
 * Re-uploading content will cause it to get overwritten. Content appears atomically
 * on the filesystem. 
 *
 * @param {object} response        HTTP response object
 * @param {string} job             A unique identifier for the job
 * @param {string} elementType     The kind of content being uploaded (eg slice, result, argument...)
 * @param {string} element         A unique identifier for the resource within the job (eg slice number)
 */
exports.sendContent = function utils$$sendContent(response, job, elementType, element)
{
  try
  {
    job         = encodeURI(job);
    elementType = encodeURI(elementType);
    element     = encodeURI(element);

    const filenameStub = path.join('jobs',  job, elementType, element, 'content');
    const filename     = path.join(jobsDir, job, elementType, element, 'content-type');
    if (!filename.startsWith(jobsDir))
      throw new Error('Invalid pathname');

    const contentType = fs.readFileSync(filename);
    exports.sendFile(response, contentType, filenameStub);
  }
  catch(error)
  {
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end(`500 - ${error.code || 'Internal Server'} error sending ${elementType} ${element} of job ${job}\n\n` + error.stack);
  }
}
  
/**
 * @return {object} instance of URL which is our best guess at the URI in the original HTTP request
 */
exports.getRequestUrl = function utils$$getRequestUrl(request)
{
  var protocol, requestUri, host;

  if (request.headers['x-proxy-scheme'])
    protocol = request.headers['x-proxy-scheme'] + ':';
  else if (request.headers.origin || request.referer)
    protocol = (request.headers.origin || request.referer).match(/(^[a-z]*:)\/\//)[1];
  else
    protocol = config.listen.protocol;

  host = request.headers['x-proxy-host'] || request.headers.host;
  requestUri = request.headers['x-proxy-request-uri'] || request.url;

  if (!protocol || !requestUri || !host)
    throw new Error('could not determine server name or url from request');

  return new URL(protocol + '//' + host + requestUri);
}

/**
 * Return the location of the service, from the Internet's POV. This is often, but not always,
 * the same as the listen location, and can often, but not always, inferred from the request.
 * If `config.location` is specified and it is not the same instance of URL as `config.listen`,
 * then we use that location. Otherwise, we try and figure it out.
 *
 * @return {object} instance of URL
 */
exports.getLocation = function utils$$getLocation(request)
{
  if (config.location !== config.listen)
    return config.location;

  return exports.getRequestUrl(request);
}

/**
 * Enable logging from a stream.
 * E.g.
 * stream = fs.createReadStream(filename, {encoding: 'binary'});
 * logChunks(stream);
 *
 * @param {*} readable - a readable stream.
 */
async function logChunks(readableStream) {
  for await (const data of readableStream) {
    console.log(typeof data, data.constructor);
    if (typeof data === 'string') {
      for (let k = 0; k < data.length; k++)
        console.log(`codePointAt(${k}): ${data.codePointAt(k).toString(16)}`);
    }
  }
}

/**
 * Quck and dirty JSON serialization that ignores cycles.
 *
 * @param {*} o        - entity to be serialized.
 * @param {number} len - number of string elements to return.
 * @returns {string}
 */
exports.stringify = function _stringify(o, len = 512) {
  if (!o) return 'nada';
  let cache = [];
  const str = JSON.stringify(o, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.includes(value)) return;
      cache.push(value);
    }
    return value;
  });
  cache = null;
  return str.slice(0, len);
}
