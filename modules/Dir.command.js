class DirCommand {
    constructor(){
        // TODO: datamanager for extensions - no preset/preload - double array filepath/extension
        this._cache_extsearch = null;
    }


    listExtensionsStats(options){
        options = _.merge({
            extension:null      //focus on this extension
        },options);

        let _esobj = {
            path:ConfigMgr.get('SamplesDirectory'),
            extensions:{},
            filepaths:{},
            filecount:0
        };
        if( !_.isObject(this._cache_extsearch) ||
            this._cache_extsearch.path != _esobj.path
        ){
            DirectoryTree.walkDirectory(_esobj.path,{
                itemCb:(item)=>{
                    if(!item.isFile) return;
                    //let _ext = (item.ext.length>0?item.ext:item.base);
                    let _ext = item.ext;
                    if(_ext.length==0) return;
                    if(!_esobj.extensions[_ext]){
                        _esobj.filepaths[_ext]=[];
                        _esobj.extensions[_ext]=0;
                    }
                    _esobj.filepaths[_ext].push(item.rel_path);
                    _esobj.extensions[_ext]++;
                    _esobj.filecount++;
                }
            });
            _esobj.extensions = Utils.sortObjectByValue(_esobj.extensions);
            this._cache_extsearch = _esobj;
        }
        _esobj = this._cache_extsearch;

        if(_.isString(options.extension) && options.extension.length>0){
            if(options.extension[0]!='.') options.extension='.'+options.extension;
            if(!_.isArray(_esobj.filepaths[options.extension]) || _esobj.filepaths[options.extension].length==0){
                UI.print("No files for the extension '"+options.extension+"' ");
                return;
            }
            UI.print("Files found with extension '"+options.extension+"' ");
            for(let i=0; i<_esobj.filepaths[options.extension].length; i++){
                UI.print(' ',_esobj.filepaths[options.extension][i]);
            }
            return;
        }

        let k = _.keys(_esobj.extensions);
        if(k.length==0){
            UI.print("No extensions found in '"+_esobj.path+"' ");
            return;
        }

        let padding = (''+_esobj.filecount+'').length;
        UI.print("Extensions found in '"+_esobj.path+"' ");
        for(let i=0; i<k.length; i++){
            UI.print(' ',_.padStart(_esobj.extensions[k[i]],padding),'',k[i]);
        }
    }

}

module.exports = new DirCommand();
