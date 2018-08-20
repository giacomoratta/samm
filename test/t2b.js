global._ =  require('lodash');
global.Utils = require('../libs/Utils.js');
global.DT = require('../libs/DirectoryTree.class.js');
global.DM = require('../libs/DataManager.js');

DM.setFileObjectRelationship({
    label:'scan_index',
    filePath:"/Users/ictmacbook/Documents/Adobe",
    autoLoad:false,
    getCb:(data)=>{
    },
    setCb:(data)=>{
        let tt = new DT(data.filePath);
        if(!tt.error()) {
            tt.walk({
                itemCb:(data)=>{
                    console.log(data.level, data.is_first_child, data.is_last_child, data.item.path, data.parent.path);
                }
            });
            return tt;
        }
    }
});

let tt = new DT("/Users/ictmacbook/Documents/Adobe/Adobe Media Encoder");
if(!tt.error()) {
    tt.walk({
        itemCb:(data)=>{
            console.log(data.level, data.is_first_child, data.is_last_child, data.item.path, data.parent.path);
        }
    });
}

//console.log(tt);
