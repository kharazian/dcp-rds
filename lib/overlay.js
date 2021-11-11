/**
 * @file        overlay.js
 * @author      Wes Garland, wes@kingsds.network
 * @date        Nov 2021
 */

/**
 * Overlay an object with the exports from a module.
 * @param {object} target               the object to modify
 * @param {string} moduleIdentifier     the module to load, if present
 * @returns true if successul
 */

exports.overlay = function overlay(target, moduleIdentifier)
{
  var moduleExports;
  
  try
  {
    moduleExports = require(moduleIdentifier);
    Object.assign(target, moduleExports);
    return true;
  }
  catch (error)
  {
    if (error.code === 'MODULE_NOT_FOUND')
      return false;
    throw error;
  }
}       
