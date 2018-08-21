global._ =  require('lodash');
global.Utils = require('../libs/Utils.js');
global.DT = require('../libs/DirectoryTree.class.js');
global.DM = require('../libs/DataManager.js');

DM.setRelationship({
    label:'scan_index',
    filePath:"/dir/dir/scan_file",
    fileType:'json',
    checkFn:(dataObj,args)=>{
        return (dataObj && !dataObj.error());
    },
    getFn:(dataObj,$cfg,args)=>{
    },
    setFn:($cfg,args)=>{
        let tt = new DT("/Users/ictmacbook/Documents/Adobe");
        tt.set();
        if(!tt.error()) {
            return tt;
        }
    },
    loadFn:(fileData,$cfg,args)=>{
        if(filedata){
            let tt = new DT("/Users/ictmacbook/Documents/Adobe");
            tt.fromJsonString(filedata);
            if(!tt.error()) return tt;
        }

    },
    saveFn:(dataObj,$cfg,args)=>{
        if(!$cfg.checkFn(dataObj)) return;
        return tt.toJsonString();
    }
});

DM.get('scan_index');
DM.set('scan_index');
DM.set('scan_index',obj);

let tt = new DT("/Users/ictmacbook/Documents/Adobe/Adobe Media Encoder");
if(!tt.error()) {
    tt.walk({
        itemCb:(data)=>{
            console.log(data.level, data.is_first_child, data.is_last_child, data.item.path, data.parent.path);
        }
    });
}

//console.log(tt);
