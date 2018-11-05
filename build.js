const { compile } = require('nexe');

/*
* read package version
* create 3 directories
* copy config.samples
* make zip files
* */

compile({
    input: './app-prod.js',
    output: './build/y',
    verbose:true
}).then(() => {
    console.log('success')
});