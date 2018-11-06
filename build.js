const nexe_compiler = require('nexe');
const package_json = require('./package.json');
global._ =  require('lodash');
global.Utils = require('./libs/Utils.js');

let b$cfg = {
    version:package_json.version,
    build_dir:Utils.File.setAsAbsPath('build'),
    compile_options:{
        input: './app-prod.js',
        output: null, //'./build/y',
        verbose:true
    },
    platforms:{
        /*
        * key: only [a-z\_]
        * _ will be replaced with . to create a signature
        */
        'mac_x64':{
            config_sample: Utils.File.setAsAbsPath('config.sample.unix.json',true),
            compile_options:{
                target: 'mac-x64-10.13.0'
            }
        },
        'win_x64':{
            config_sample: Utils.File.setAsAbsPath('config.sample.win.json',true),
            compile_options:{
                target: 'windows-x64-10.13.0'
            }
        },
        'win_x86':{
            config_sample: Utils.File.setAsAbsPath('config.sample.win.json',true),
            compile_options:{
                target: 'windows-x86-10.13.0'
            }
        },
        'linux_x64':{
            config_sample: Utils.File.setAsAbsPath('config.sample.unix.json',true),
            compile_options:{
                target: 'linux-x64-10.13.0'
            }
        },
        'linux_x86':{
            config_sample: Utils.File.setAsAbsPath('config.sample.unix.json',true),
            compile_options:{
                target: 'linux-x86-10.13.0'
            }
        },
    }

};

console.log("\n"+'MPL:Build');

console.log("\n"+'Delete directory for build:',b$cfg.build_dir);
Utils.File.removeDirSync(b$cfg.build_dir);

console.log("\n"+'Create directory for build:',b$cfg.build_dir);
Utils.File.ensureDirSync(b$cfg.build_dir);

Utils.EXIT();

/*
* create directory ./build/mpl.0.0.0.mac.x64
* create file      ./build/mpl.0.0.0.mac.x64/config.sample.json from config.sample.unix.json
* create directory ./build/mpl.0.0.0.win.x86
* create file      ./build/mpl.0.0.0.win.x86/config.sample.json from config.sample.win.json
* create directory ./build/mpl.0.0.0.win.x64
* create file      ./build/mpl.0.0.0.win.x64/config.sample.json from config.sample.win.json
* create directory ./build/mpl.0.0.0.linux.x86
* create file      ./build/mpl.0.0.0.linux.x86/config.sample.json from config.sample.unix.json
* create directory ./build/mpl.0.0.0.linux.x64
* create file      ./build/mpl.0.0.0.linux.x64/config.sample.json from config.sample.unix.json
* compile for mac.x64
* compile for win.x86
* compile for win.x64
* compile for linux.x86
* compile for linux.x64
* make zip files and delete original directories
* */

nexe_compiler({
    input: './app-prod.js',
    output: './build/y',
    verbose:true
}).then(() => {
    console.log('success')
});