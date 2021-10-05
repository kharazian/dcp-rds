/**
 * @file        lib/logging.js      Helper module for things logging in the slice service
 * @author      Wes Garland, wes@kingsds.network
 * @date        Apr 2020, Oct 2021
 */

/** Extract the remote ip address from HTTP request headers.
 *  Understands proxies and reverse proxies, and returns the
 *  IP corresponding to the public address (post SNAT) of the 
 *  remote entity (eg browser).
 *
 *  @note       These addresses cannot be considered rigorous 
 *              from a legal/security POV unless the daemon or
 *              an upstream entity has taken pains to remove
 *              any fake X-Real-IP etc headers which could be 
 *              injected by a malicious remote entity.
 *
 *              Also, it is possible to configure nginx to obliterate
 *              the Squid headers, so some situations may return
 *              the address of the border proxy instead of the remove
 *              host.
 *
 *  @param      headers {object}        Headers from the HTTP request. Each header name is an
 *                                      object property. All properties are lower-caes.
 *  @param      socketAddress {string}  The IP address to return if there are no headers 
 *                                      indicating an alternative.
 *  @returns {string} the IP address
 */
exports.ipAddress = function httpUtil$$ipAddress(headers, socketAddress) {
  /* rfc 7239 */
  if (headers['forwarded'])
    return headers['forwarded'].replace(/^[^=]*=/,'').replace(/;.*$/,'');
  
  /* squid */
  if (headers['x-forwarded-for'])
    return headers['x-forwarded-for'];

  /* some reverse proxies (nginx?) */
  if (headers['x-real-ip'])
    return headers['x-real-ip'];

  /* return ipv4 address that was mapped into ipv6 address space */
  if (socketAddress.startsWith('::ffff:'))
    return socketAddress.slice(7);

  return socketAddress;
}
