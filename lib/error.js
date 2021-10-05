/**
 * @file        lib/error.js
 *              Simple Error implementation for dcp-slice-httpd that understands Error.code in the constructor
 * @author      Wes Garland, wes@kingsds.network
 * @date        Oct 2021
 */

/**
 * @constructor
 * @param {string} message      error message - human readable, english
 * @param {code}   code         error code - for machines
 * @returns instance of Error (not exports.Error)
 */
exports.Error = function Error(message, code)
{
  var error = new Error.prototype.constructor(message);
  var stack = error.stack.split('\n');

  stack.splice(1,1);
  if (code)
  {
    error.code = code;
    stack[0] += ` (code: ${code})`;
  }
  error.stack = stack.join('\n');

  return error;
}
exports.Error.prototype = Error.prototype;
