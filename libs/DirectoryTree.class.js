const SymbolTree = require('symbol-tree');
const scanf = require('scanf');

class DirectoryTree {

    constructor(absPath,options){

        this._tree = null; /* Directory Tree */
        this._root = {}; //empty root

        this._data = {
            options     : DirectoryTree._parseOptions(options),
            root_path   : absPath,
            files_count : 0,
            directories_count : 0
        };
    }


    static _parseOptions(options){
        return _.merge({
            excludedExtensions:[],
            excludedPaths:[],
            itemCb:function(){},
            afterDirectoryCb:function(){}
        },options);
    }


    init(){
        this._tree = null; /* Directory Tree */
        this._root = {}; //empty root
        this._data.files_count = 0;
        this._data.directories_count = 0;
    }


    read(){
        this.init();
        let _tree = new SymbolTree();
        let _t_parent = this._root;

        DirectoryTree.walkDirectory(this._data.root_path,{
            excludedExtensions:this._data.options.excludedExtensions,
            excludedPaths:this._data.options.excludedPaths,
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
                this._data.options.itemCb(item);
            },
            afterDirectoryCb:(item)=>{
                // callback after reading directory
                _t_parent = _tree.parent(item);
                this._data.options.afterDirectoryCb(item);
            }
        });

        if(_tree.childrenCount(this._root)>0){
            this._tree = _tree;
        }
    }


    error(){
        return (this._tree==null);
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
        let base_level = null;
        let _item_path = null;

        for (const item of iterator) {
            _item_path = item.path;

            // TODO: do it better without string manipulation
            if(!base_level){
                if(_item_path.endsWith('/')) _item_path = _item_path.substr(0,_item_path.length-2);
                base_level=_.split(_item_path,'/').length;
            }

            level = _.split(_item_path,'/').length - base_level;
            isFirstChild = (_tree.firstChild(_t_parent)===item);
            isLastChild = (_tree.lastChild(_t_parent)===item);

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

        const iterator = _tree.treeIterator(this._root);
        for (const item of iterator) {
            //console.log(level,' - ',isFirstChild,isLastChild,_tree.index(item),item.path);
            options.itemCb({
                item:item
            });
        }
    }


    empty(){
        return (this.nodeCount()==0);
    }


    rootPath(){
        return (this._data.root_path);
    }


    nodeCount(){
        return (this._data.files_count+this._data.directories_count);
    }

    fileCount(){
        return (this._data.files_count);
    }

    directoryCount(){
        return (this._data.directories_count);
    }


    getRootPath(){
        return this._data.root_path;
    }


    toJson(){
        let exportObj = {};
        //exportObj._tree =  this._tree;
        //exportObj._root =  this._root;
        exportObj.data =  this._data;
        exportObj.struct = [];
        let current_node = exportObj.struct;
        let current_level = 0;
        this.walk({
            itemCb:(itemData)=>{
                delete itemData.parent;
                itemData.item = itemData.item.toJson();
                exportObj.struct.push(itemData);
            }
        })
        return exportObj;
    }


    fromJson(importObj){
        this.init();
        let _tree = new SymbolTree();
        let _t_parent = this._root;

        this._data.options.excludedExtensions = importObj.data.options.excludedExtensions;
        this._data.options.excludedPaths = importObj.data.options.excludedPaths;
        this._data.root_path = importObj.data.root_path;
        this._data.files_count = importObj.data.files_count;
        this._data.directories_count = importObj.data.directories_count;

        let _x = function(i,n){
            if(i!=n) return;
            Utils.EXIT('');
        }

        let current_level = 0;
        let latest_item = null;

        for(let i=0; i<importObj.struct.length; i++){

            let itemData = importObj.struct[i];
            let _newpathinfo = new _PathInfo();

            _newpathinfo.fromJson(itemData.item);
            itemData.item = _newpathinfo;
            //console.log(itemData.item);

            if(itemData.level==current_level){
                console.log(_.padStart(' ',itemData.level*3),_t_parent.name,_newpathinfo.base,' = same level',itemData.level,current_level);
                _tree.appendChild(_t_parent,_newpathinfo);

            }else if(itemData.level>current_level){
                _t_parent = latest_item;
                console.log(_.padStart(' ',itemData.level*3),_t_parent.name,_newpathinfo.base,' > current',itemData.level,current_level);
                _tree.appendChild(_t_parent,_newpathinfo);

            }else{
                console.log(_.padStart(' ',itemData.level*3),_t_parent.name,_newpathinfo.base,' < current',itemData.level,current_level);
                _t_parent = _tree.parent(_t_parent);
                _tree.appendChild(_t_parent,_newpathinfo);
            }
            //console.log(' --- end --- ',itemData.level,current_level);
            current_level = itemData.level;
            latest_item = _newpathinfo;

            //_x(i,2);
        }
        this._tree = _tree;
        /*
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
                this._data.options.itemCb(item);
            },
            afterDirectoryCb:(item)=>{
                // callback after reading directory
                _t_parent = _tree.parent(item);
                this._data.options.afterDirectoryCb(item);
            }
        */
    }


    toJsonString(){
    }


    fromJsonString(json_string){
    }


    static walkDirectory(absPath, options){
        options = DirectoryTree._parseOptions(options);

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

        const _wk = function(rootPath, absPath, O) {
            if(O.excludedPaths && O.excludedPaths.some((e) => e.test(absPath))) return null;

            let p_info = new _PathInfo(absPath);
            if(p_info.error==true || (!p_info.isFile && !p_info.isDirectory)) return;
            p_info.rel_root = rootPath;

            if (p_info.isFile) {
                if (O.excludedExtensions && O.excludedExtensions.test(_.lowerCase(p_info.ext))) return null;
                O.itemCb(p_info);
                return p_info;
            }
            else if (p_info.isDirectory) {
                O.itemCb(p_info);

                Utils.File.readDirectorySync(absPath,(a)=>{
                    Utils.sortFilesArray(a);
                },(v,i,a)=>{
                    v = Utils.File.pathJoin(absPath,v);
                    let _pi = _wk(rootPath,v,O);
                    if(_pi.size) p_info.size += _pi.size;
                });

                O.afterDirectoryCb(p_info);
                return p_info;
            }
        };

        absPath = Utils.File.pathResolve(absPath)+Utils.File.pathSeparator;
        options.excludedPaths = _prepareExcludedPaths(options.excludedPaths);
        options.excludedExtensions = _prepareExcludedExtensions(options.excludedExtensions);
        _wk(absPath, absPath, options);
    }
}


class _PathInfo {
    constructor(absPath){
        this.error = true;
        this._info = {};

        if(absPath){
            let p_info = Utils.File.pathParse(absPath);
            if(!p_info) return;
            let stats = Utils.File.getPathStatsSync(absPath);
            if(!stats) return;
            this.error = false;

            this._info = p_info;
            this._info.path = absPath;
            this._info.size = (stats.size?stats.size:0);
            this._info.is_file = stats.isFile();
            this._info.is_directory = stats.isDirectory();
        }
    }

    get root() { return this._info.root; }
    set root(root) { this._info.root = root; }

    get dir() { return this._info.dir; }
    set dir(dir) { this._info.dir = dir; }

    get base() { return this._info.base; }
    set base(base) { this._info.base = base; }

    get ext() { return this._info.ext; }
    set ext(ext) { this._info.ext = ext; }

    get name() { return this._info.name; }
    set name(ext) { this._info.name = name; }

    get path() { return this._info.path; }
    set path(ext) { this._info.path = path; }

    get size() { return this._info.size; }
    set size(size) { this._info.size = size; }

    get isFile() { return this._info.is_file; }
    get isDirectory() { return this._info.is_directory; }

    get rel_root() { return this._info.rel_root; }
    set rel_root(root) {
        this._info.rel_root = root;
        this._info.rel_path = this._info.path.substring(this._info.rel_root.length);
    }
    get rel_path() { return this._info.rel_path; }

    get sizeString() {
        let s = this._info.size;
        if(s<1024) return s+' B';
        if(s<1048576) return Math.round(s/1024)+' KB';
        if(s<1073741824) return Math.round(s/1048576)+' MB';
        if(s<1099511627776) return Math.round(s/1073741824)+' GB';
        return Math.round(s/(1099511627776))+' TB';
    }

    toJson(){
        return this._info;
    }

    fromJson(data){
        this._info = data;
        this.error = false;
    }
}


module.exports = DirectoryTree;
