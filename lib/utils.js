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
  var dir = path.join(config.storageDir, 'jobs', job, slice);
  var tmp = path.join(dir, Date.now() + 'slice-datum.tmp.' + process.pid);

  if (busyFiles[tmp])
    throw new Error('Already uploading this file!');

  try
  {
    busyFiles[tmp] = true;
    fs.mkdirSync(dir, { recursive: true });
    await fs.promises.writeFile(tmp, sliceDatum, typeof sliceDatum === 'string' ? 'utf-8' : {});
    fs.renameSync(tmp, path.join(dir, 'slice-datum'));
  }
  finally
  {
    delete busyFiles[tmp];
  }
  
  fs.writeFileSync(path.join(dir, 'content-type'), contentType, 'utf-8');
}
