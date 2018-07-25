/* Standard Libraries */
global._ =  require('lodash');
global.path = require('path');
global.fs = require('fs');
global.fs_extra = require('fs-extra');
global.d = console.log;

/* Project Libraries */
global.ConfigMgr = require('./libs/ConfigManager.js');
global.Utils = require('./libs/Utils.js');
global.CliMgr = require('./libs/CliManager.js');
global.SamplesMgr = require('./libs/SamplesManager.js');

/* Help function */
function printHelp(){
    console.log("\nHelp");
}

/* Project logic & interface */
let cli_params = [];
if(process.argv.length<3){
    printHelp();
    process.exit(0);
}
else{
    cli_params=_.slice(process.argv,2);
}

let command = cli_params[0];

if(command=='set'){
    CliMgr.C_set(cli_params);

} else if(command=='config'){
    ConfigMgr.print();

} else if(command=='lookup'){
    CliMgr.C_lookup(cli_params);

} else if(command=='save'){
    CliMgr.C_save(cli_params);

} else if(command=='scan'){
    CliMgr.C_scan(cli_params);

} else {
    console.log(" Unrecognized command");
    printHelp();
}

console.log("\n");
