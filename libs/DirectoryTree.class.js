const SymbolTree = require('symbol-tree');

class DirectoryTree {

    constructor(absPath,options){

        this._dt = null; /* Directory Tree */
        this._tree = null;
        this._root = {}; //empty root

        this._data = {
            options     : options,
            root_path   : absPath,
            files_count : 0,
            directories_count : 0
        };

        options = _.merge({
            excludedExtensions:[],
            excludedPaths:[],
            itemCb:function(){},
            afterDirectoryCb:function(){}
        },options);

        let _tree = new SymbolTree();
        let _t_parent = this._root;

        DirectoryTree.walkDirectory(this._data.root_path,{
            excludedExtensions:options.excludedExtensions,
            excludedPaths:options.excludedPaths,
            itemCb:(item)=>{
                // callback for each item
                if(item.isFile===true){
                    _tree.appendChild(_t_parent,item);
                    this._data.files_count++;
                }
                else if(item.isDirectory===true){
                    _t_parent = _tree.appendChild(_t_parent,item);
                    this._data.directories_count++;
                }
                options.itemCb(item);
            },
            afterDirectoryCb:(item)=>{
                // callback after reading directory
                _t_parent = _tree.parent(item);
                options.afterDirectoryCb(item);
            }
        });

        if(_tree.childrenCount(this._root)>0){
            this._tree = _tree;
        }
    }


    walk(options){
        if(!this._tree || !this._root) return;
        let _tree = this._tree;
        let _t_parent = _tree.firstChild(this._root);
        if(!_t_parent) return;

        options = _.merge({
            itemCb:function(){}
        },options);

        let level = -1;
        let prev_index = 0;
        let isFirstChild, isLastChild;

        const iterator = _tree.treeIterator(_t_parent);
        for (const item of iterator) {
            _t_parent = _tree.parent(item);

            isFirstChild = (_tree.firstChild(_t_parent)===item);
            isLastChild = (_tree.lastChild(_t_parent)===item);

            if(_tree.index(item)==0){
                level++;
            }else if((_tree.index(item)-prev_index)!=1){
                level--;
            }
            prev_index = _tree.index(item);

            //console.log(level,' - ',isFirstChild,isLastChild,_tree.index(item),item.path);
            options.itemCb({
                item:item,
                parent:_t_parent,
                level:level,
                is_first_child:isFirstChild,
                is_last_child:isLastChild
            });
        }
    }


    forEach(options){
        if(!this._tree || !this._root) return;
        let _tree = this._tree;

        options = _.merge({
            itemCb:function(){}
        },options);

        const iterator = _tree.treeIterator(_t_parent);
        for (const item of iterator) {
            //console.log(level,' - ',isFirstChild,isLastChild,_tree.index(item),item.path);
            options.itemCb({
                item:item
            });
        }
    }


    empty(){
        return (this._data.files_count==0 && this._data.directories_count==0);
    }


    size(){
        return (this._data.files_count+this._data.directories_count);
    }


    getRootPath(){
        return this._data.root_path;
    }


    toJsonString(){
    }


    fromJsonString(json_string){
    }


    static walkDirectory(absPath, options){

        const _prepareExcludedPaths = function(excludedPaths){
            // /some_path_to_exclude/
            if(!_.isArray(excludedPaths) || excludedPaths.length==0) return null;
            let exclArray = [];
            excludedPaths.forEach(function(v){
                exclArray.push(_.escapeRegExp(v));
            });
            if(excludedPaths.length==0) return null;
            return exclArray;
        };

        const _prepareExcludedExtensions = function(excludedExtensions){
            //.*(sh|ini|jpg|vhost|xml|png)$  or  /\.txt$/
            if(!_.isArray(excludedExtensions) || excludedExtensions.length==0) return null;
            return '('+_.escapeRegExp(_.join(excludedExtensions,'|'))+')$';
        };

        const _wk = function(absPath, O) {
            if(O.excludedPaths && O.excludedPaths.some((e) => e.test(absPath))) return null;

            let stats = Utils.File.getPathStatsSync(absPath);
            if(!stats || (!stats.isFile() && !stats.isDirectory())) return;

            let p_info = Utils.File.pathParse(absPath);
            p_info.path = absPath;

            if (stats.isFile()) {
                if (O.excludedExtensions && O.excludedExtensions.test(_.lowerCase(p_info.ext))) return null;

                p_info.size = stats.size;  // bytes
                p_info.isFile = true;
                O.itemCb(p_info);
                return p_info;
            }
            else if (stats.isDirectory()) {
                p_info.isDirectory = true;
                O.itemCb(p_info);
                p_info.size = 0;

                Utils.File.readDirectorySync(absPath,(a)=>{
                    Utils.sortFilesArray(a);
                },(v,i,a)=>{
                    v = Utils.File.pathJoin(absPath,v);
                    let _pi = _wk(v,O);
                    if(_pi.size) p_info.size += _pi.size;
                });

                O.afterDirectoryCb(p_info);
                return p_info;
            }
        };

        options.excludedPaths = _prepareExcludedPaths(options.excludedPaths),
            options.excludedExtensions = _prepareExcludedExtensions(options.excludedExtensions)
        _wk(absPath, options);
    }
}

module.exports = DirectoryTree;
