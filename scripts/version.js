const { gitDescribeSync } = require('git-describe');
const { version } = require('../package.json');
const { resolve, relative } = require('path');
const { writeFileSync } = require('fs-extra');
const moment = require('moment');

const gitInfo = gitDescribeSync({
    dirtyMark: false,
    dirtySemver: false,
});

gitInfo.version = version;
const dateTime = moment(new Date()).format('YYMMDDHHmm');
gitInfo.buildDate = parseInt(dateTime, 10).toString(36); // convert to base 36

const file = resolve(__dirname, '../', 'src', 'environments', 'version.ts');
writeFileSync(file,
`// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
/* tslint:disable */
export const VERSION = ${JSON.stringify(gitInfo, null, 4)};
/* tslint:enable */
`, { encoding: 'utf-8' });

console.log(`Wrote version info ${gitInfo.raw} to ${relative(resolve(__dirname, '..'), file)}`);
