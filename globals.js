/* Standard Libraries */
global.d = function(){
    let pp = '------------------------------';
    let pre = '';
    let post = ' '+pp+pp;
    let tp = " - "+Date.now()+' ';
    console.log("\n\n"+pre+"< debug"+tp+">"+post);
    console.log.apply(null,arguments);
    console.log(pre+"< END debug"+tp+">"+post+"\n");
}
//global.d = function(){};

global._ =  require('lodash');
global.readlinesync = require('readline-sync');

global.UI = {
    print:console.log,
    warning:console.warn,
    error:console.error
};
global.MPL_Options = {

};

/* Common Libraries */
global.Utils = require('./libs/Utils.js');
global.DataCache = require('./libs/DataCache.class.js');
global.PathInfo = require('./libs/PathInfo.class.js');
global.DirectoryTree = require('./libs/DirectoryTree.class.js');
global.Samples = require('./libs/Samples.class.js');
global.SamplesTree = require('./libs/SamplesTree.class.js');
global.DataMgr = require('./libs/DataManager.js');

/* Project Modules */
global.ConfigMgr = require('./modules/ConfigManager.js');
global.CliMgr = require('./modules/CliManager.js');
global.SamplesMgr = require('./modules/SamplesManager.js');