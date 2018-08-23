DataMgr.setHolder({
    label:'scan_index',
    filePath:ConfigMgr.path('samples_index'),
    fileType:'json',
    preLoad:true,

    checkFn:(dataObj,args)=>{
        return (dataObj && !dataObj.error());
    },

    getFn:(dataObj,$cfg,args)=>{
        return dataObj;
    },

    setFn:($cfg,args)=>{
        let tt = new DirectoryTree(ConfigMgr.path('samples_directory'));
        try{
            tt.read();
            if(!tt.error()) return tt;
        }catch(e){
            return null;
        }
        return null;
    },

    loadFn:(fileData,$cfg,args)=>{
        if(!_.isObject(fileData)) return null;
        let tt = new DirectoryTree(ConfigMgr.path('samples_directory'));
        tt.fromJson(fileData);
        if(!tt.error()) return tt;
        return null;
    },

    saveFn:(dataObj,$cfg,args)=>{
        if(!$cfg.checkFn(dataObj)) return;
        return dataObj.toJson();
    }
});
