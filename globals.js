
/* Standard Libraries */
global.d$ = function(){
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
require('./libs/Lodash.Extensions.js');
global.scanf = require('scanf');
global.readlinesync = require('readline-sync');
global.UI = new (require('./modules/UI.class.js'))({ /*options*/ });

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
global.DirCommand = require('./modules/Dir.command.js');