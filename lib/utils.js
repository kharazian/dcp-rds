/**
 * @file        lib/utils.js
 *              Misc utility functions for dcp-slice-httpd server
 *
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */

const path   = require('path');
const fs     = require('fs');
const nanoid = require('nanoid').nanoid;
const config = require('../etc/config');
const busyFiles = {};

/**
 * Generate a unique identifier
 * @return {string}
 */
exports.randomId = function utils$$randomId()
{
  return nanoid(32);
}

/**
 * Write a slice datum and content-type to disk.
 *
 * Re-uploading a slice will cause it to get overwritten. Slice data appear atomically
 * on the filesystem. 
 *
 * @param {Buffer | string}     sliceDatum      The slice datum. A buffer will be written to disk as
 *                                              raw, uninterpreted bytes. A string will be converted
 *                                              to utf-8 during the write.
 * @param {string}              job             A unique identifier for the job
 * @param {string}              slice           A unique identifier for the slice within the job
 * @param {string}              contentType     The MIME type of the sliceDatum; used eventually by
 *                                              the worker to figure out/if the data should be
 *                                              deserialized and what JS type it will become.
 */
exports.writeSlice = async function utils$$writeSlice(sliceDatum, job, slice, contentType)
{
  job   = encodeURI(job);
  slice = encodeURI(slice);

  const dir = path.join(config.storageDir, 'jobs', job, slice);
  const tmp = path.join(dir, Date.now() + 'slice-datum.tmp.' + process.pid);

  if (busyFiles[tmp])
    throw new Error('Already uploading this file!');
  
  try
  {
    busyFiles[tmp] = true;
    fs.mkdirSync(dir, { recursive: true });
    await fs.promises.writeFile(tmp, sliceDatum, typeof sliceDatum === 'string' ? 'utf-8' : {});
    fs.renameSync(tmp, path.join(dir, 'slice-datum'));
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
  stream = fs.createReadStream(filename);
  stream.pipe(response);
}

exports.sendSlice = function utils$$sendSlice(response, job, slice)
{
  try
  {
    job   = encodeURI(job);
    slice = encodeURI(slice);

    const filenameStub = path.join('jobs', job, slice, 'slice-datum');
    const contentType = fs.readFileSync(path.join(config.storageDir, 'jobs', job, slice, 'content-type'));

    exports.sendFile(response, contentType, filenameStub);
  }
  catch(error)
  {
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end(`500 - ${error.code || 'Internal Server'} error sending slice ${slice} of job ${job}\n\n` + error.stack);
  }
}
  
/**
 * @return {object} instance of URL which is our best guess at the URI in the original HTTP request
 */
exports.getRequestUrl = function utils$$getRequestUrl(request)
{
  var protocol;

  if (request.origin || request.referer)
    protocol = (request.origin || request.referer).match(/(^[a-z]*:)\/\//)[1];
  else
    protocol = config.listen.protocol;

  return new URL(protocol + request.headers.host + request.url);
}

