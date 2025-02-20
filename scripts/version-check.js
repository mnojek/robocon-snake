const fs = require('fs');
const path = require('path');
const semver = require('semver');

async function main() {
    const packageVersion = require('../package.json').version;
    const versionFilePath = path.join(process.cwd(), 'public', 'version.js');
    
    if (!fs.existsSync(versionFilePath)) {
        console.error(`Error: version.js file is missing at ${versionFilePath}`);
        process.exit(1);
    }

    const versionModule = await import('../public/version.js');
    const versionJs = versionModule.default;

    if (packageVersion !== versionJs) {
        console.error('Version mismatch!');
        console.error(`package.json version: ${packageVersion}`);
        console.error(`version.js version: ${versionJs}`);
        process.exit(1);
    }

    // If target version is provided as argument, compare versions
    if (process.argv[2]) {
        const targetVersion = process.argv[2];
        if (!semver.gt(packageVersion, targetVersion)) {
            console.error(`Error: New version (${packageVersion}) must be higher than target branch version (${targetVersion})`);
            process.exit(1);
        }
    }

    console.log(packageVersion);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
