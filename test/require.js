let _test_data = {
};

global.ConfigManagerOptions = {
    //config_file:'test/configs/config_osx_test1.json',
    config_file:'test/configs/config_osx_test1.json',
    temp_dir: 'test/temp_dir/',
    custom_indexes: 'test/temp_dir/c_indexes/',
    latest_lookup: 'test/temp_dir/latest_lookup',
    samples_index: 'test/temp_dir/samples_index.json'
}

require('../globals.js');
global.assert = require('assert');
//global.d = function(){}; // To disable debug messages
global.tLog = function(){
    if(_.isString(arguments[0])){
        arguments[0]='\t'+arguments[0];
    }
    console.log.apply(null,arguments);
};

module.exports = _test_data;
