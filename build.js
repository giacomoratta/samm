const { compile } = require('nexe');
global.prod = true;

compile({
    input: './my-app.js',
    output: './build/y',
    build: true, //required to use patches
    verbose:true
}).then(() => {
    console.log('success')
});