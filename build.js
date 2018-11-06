const compile = require('nexe');
const package_json = require('./package.json');
const Utils = require('./libs/Utils.js');

/*
* delete directory ./build with rimraf
* create directory ./build
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

compile({
    input: './app-prod.js',
    output: './build/y',
    verbose:true
}).then(() => {
    console.log('success')
});