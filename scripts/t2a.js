global._ =  require('lodash');
global.Utils = require('../libs/Utils.js');
global.DT = require('../libs/DirectoryTree.js');

Utils.File.walkDirectory("L:\\MPL\\One Shots\\Cymatics - Vocals",{
    nodeCallback:(item)=>{
        // callback for each item
        if(item.isDirectory===true) console.log(item);
        // if(item.isFile===true) console.log(item);
        // if(item.isDirectory===true) console.log(item);
    },
    afterDirectoryCallback:(item)=>{

    }
});
