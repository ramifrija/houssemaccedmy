import xcode from 'xcode';
import fs from 'fs';

const projectPath = './ios/App/App.xcodeproj/project.pbxproj';
const myProj = xcode.project(projectPath);

myProj.parseSync();

// Set the build setting CODE_SIGN_ENTITLEMENTS to App/App.entitlements for all configurations
const configurations = myProj.pbxXCBuildConfigurationSection();
for (const key in configurations) {
    const config = configurations[key];
    if (typeof config === 'object' && config.buildSettings) {
        // Only apply to the main app target (usually the one containing ASSETCATALOG_COMPILER_APPICON_NAME)
        if (config.buildSettings['ASSETCATALOG_COMPILER_APPICON_NAME'] || config.buildSettings['INFOPLIST_FILE']) {
            config.buildSettings['CODE_SIGN_ENTITLEMENTS'] = '"App/App.entitlements"';
        }
    }
}

fs.writeFileSync(projectPath, myProj.writeSync());
console.log('Project modified successfully');
