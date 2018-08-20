global._ =  require('lodash');
global.Utils = require('../libs/Utils.js');
global.DT = require('../libs/DirectoryTree.class.js');

let tt = new DT("/Users/ictmacbook/Documents/Adobe/Adobe Media Encoder");

tt.walk({
    itemCb:(data)=>{

        //console.log(data.level, data.is_first_child, data.is_last_child, data.item.path, data.parent.path);
    }
});
//console.log(tt);
