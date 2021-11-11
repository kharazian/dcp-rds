/**
 * @file        postinstall.js
 *              Post-install steps for dcp-rds package which make admin's
 *              lives easier.
 *
 * @author      Wes Garland, wes@kingsds.network
 * @date        Nov 2021
 */

const process = require('process');
const fs      = require('fs');
const path    = require('path');

const prefix  = path.resolve(process.env.npm_config_prefix);

console.log('DCP Remote Data Service: post-install');
console.log('Copyright (c) 2021 Kings Distributed Systems, Ltd.');
console.log('Licensed under the terms of the MIT License.');

if (process.env.npm_config_global !== 'true')
{
  console.log(' - skipping: not a global install');
  process.exit(0);
}

//if (!process.env.DEBUG)
//  console.debug = function(){};
console.debug(` - installed in ${process.env.npm_config_prefix}`);
console.debug(` - running in ${process.cwd()}`);

const sampleConfig = path.join(process.cwd(), 'etc', 'dcp-rds-config.sample');
const niceConfig = path.join(prefix, 'etc', 'dcp-rds-config.js');

console.log(`\nTo complete the install, run the following commands:`);
console.log(`\tsudo mkdir "${path.dirname(niceConfig)}"`);
console.log(`\tsudo mkdir "${path.join(prefix, 'storage')}"`);
console.log(`\tsudo cp --no-clobber "${sampleConfig}" "${niceConfig}"`);
console.log(`\tsed -e "s;/var/dcp-rds/;${prefix}/;" < "${process.cwd()}/systemctl/dcp-rds.service" | sudo sh -c 'cat > /etc/systemd/system/dcp-rds.service'`);
console.log('\tsudo systemctl daemon-reload');
console.log('\ttty >/dev/null || sudo systemctl restart dcp-rds');
console.log(`\ttty >/dev/null && sudo ${process.env.VISUAL || process.env.EDITOR || 'vi'} ${niceConfig} && sudo systemctl restart dcp-rds`);
console.log('');
