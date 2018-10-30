class DirCommand {
    constructor(){
    }

    listExtensionsStats(){
        let extensions = {};
        let filecount = 0;
        DirectoryTree.walkDirectory(ConfigMgr.get('SamplesDirectory'),{
            itemCb:(item)=>{
                if(!item.isFile) return;
                let _ext = (item.ext.length>0?item.ext:item.base);
                if(_ext.length==0) return;
                if(!extensions[_ext]) extensions[_ext]=0;
                extensions[_ext]++;
                filecount++;
            }
        });
        extensions = Utils.sortObjectByValue(extensions);
        let k = _.keys(extensions);
        if(k.length==0){
            UI.print("No extensions found in '"+ConfigMgr.get('SamplesDirectory')+"' ");
            return;
        }

        let padding = (''+filecount+'').length;
        UI.print("Extensions found in '"+ConfigMgr.get('SamplesDirectory')+"' ");
        for(let i=k.length-1; i>=0; i--){
            UI.print(' ',_.padStart(extensions[k[i]],padding),'',k[i]);
        }
    }

}

module.exports = new DirCommand();