let _test_data = {
};

global.ConfigManagerOptions = {
    //config_file:'test/configs/config_osx_test1.json',
    config_file:'test/configs/config_osx_test1.json',
    working_dir: 'test/userdata/',
    latest_lookup: 'test/userdata/latest_lookup',
    samples_index: 'test/userdata/samples_index.json'
};

require('../../globals.js');
global.assert = require('assert');
//global.d = function(){}; // To disable debug messages
global.tLog = function(){
    if(_.isString(arguments[0])){
        arguments[0]='\t'+arguments[0];
    }
    console.log.apply(null,arguments);
};

module.exports = _test_data;
