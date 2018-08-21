let _config = {
    window: {

    },
    osx:{

    },
    osx_test1:{
        SamplesDirectory:"/Users/ictmacbook/Documents/Adobe/Premiere Pro"
    }
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

require('../globals.js');
global.assert = require('assert');
global.d = function(){};
global.tLog = function(){
    if(_.isString(arguments[0])){
        arguments[0]='\t'+arguments[0];
    }
    console.log.apply(null,arguments);
};

let _loaded_cfg = require('../config.json');
_config = _.merge(_loaded_cfg,_config.osx_test1);

module.exports = _config;