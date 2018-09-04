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


    read(options){
        this.init();
        let _tree = new SymbolTree();
        let _t_parent = this._root;

        options = _.merge({
            fileAcceptabilityFn:function(/*  {PathInfo} item  */){return true;}
        },options);

        DirectoryTree.walkDirectory(this._data.root_path,{
            excludedExtensions:this._data.options.excludedExtensions,
            excludedPaths:this._data.options.excludedPaths,
            itemCb:(item)=>{
                // callback for each item
                if(item.isFile===true && options.fileAcceptabilityFn(item)===true){
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
        let prev_level = 0;
        let _item_path = null;

        for (const item of iterator) {
            _item_path = item.path;

            if(prev_level != item.level){
                _t_parent = _tree.parent(item);
                prev_level = item.level;
            }

            isFirstChild = (_tree.firstChild(_t_parent)===item);
            isLastChild = (_tree.lastChild(_t_parent)===item);

            options.itemCb({
                item:item,
                parent:_t_parent,
                //level:level,
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
        });
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

        let prev_level = 1;
        let latest_item,_newpathinfo = null;

        for(let i=0; i<importObj.struct.length; i++){

            _newpathinfo = new PathInfo();
            _newpathinfo.fromJson(importObj.struct[i].item);
            //console.log(itemData.item);

            if(_newpathinfo.level==prev_level){
                //console.log(_.padStart(' ',itemData.level*3),_t_parent.name,' # ',_newpathinfo.base,' = same level',itemData.level,prev_level);

            }else if(_newpathinfo.level>prev_level){
                _t_parent = latest_item;
                //console.log(_.padStart(' ',itemData.level*3),_t_parent.name,' # ',_newpathinfo.base,' > previous',itemData.level,prev_level);

            }else{
                for(let j=_newpathinfo.level; j<prev_level; j++) _t_parent = _tree.parent(_t_parent);
                //console.log(_.padStart(' ',itemData.level*3),_t_parent.name,' # ',_newpathinfo.base,' < previous',itemData.level,prev_level);
                //console.log(_.padStart(' ',itemData.level*3),'>> ',_t_parent.base);
            }
            prev_level = _newpathinfo.level;
            //console.log(latest_item,_t_parent,_newpathinfo);
            //Utils.EXIT('');
            latest_item = _tree.appendChild(_t_parent,_newpathinfo);
            //console.log(latest_item);
        }
        this._tree = _tree;
    }


    isEqualTo(tree2){
        if(!tree2._tree || !tree2._root) return;
        if(!this._tree || !this._root) return;
        let _tree1 = this._tree;
        let _tree2 = tree2._tree;

        // options = _.merge({
        //     itemCb:function(){}
        // },options);

        const iterator1 = _tree1.treeIterator(this._root);
        const iterator2 = _tree2.treeIterator(tree2._root);
        let item1,item2;
        item1 = iterator1.next(); // discard the empty root
        item2 = iterator2.next(); // discard the empty root
        item1 = iterator1.next();
        item2 = iterator2.next();

        let flag = true;
        while(item1.done===false && item2.done===false){

            item1 = item1.value;
            item2 = item2.value;
            flag = item1.isEqualTo(item2);
            //console.log(flag,item1,item2);

            if(!flag) return null;

            item1 = iterator1.next();
            item2 = iterator2.next();
        }

        flag=(item1.done===item2.done);
        return flag;
    }


    print(){
        let ppre = '';
        let def1 = '|    ';
        let prev_level=0;

        String.prototype.replaceAt=function(index, replacement) {
            return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
        }
        String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };

        let preFn = function(data){
            ppre = ppre.replaceAll('\u2514',' ');
            ppre = ppre.replaceAll('\u251C','\u2502');
            ppre = ppre.replaceAll('\u2500',' ');

            if(data.item.level<1) return '';
            let p = '';
            let _level = data.item.level;
            if(_level<=1) return '';

            _level-=2;
            if(ppre.length < (5*(_level+1))) ppre += def1;
            if(ppre.length > (5*(_level+1))) ppre = ppre.substr(0,ppre.length-5*(prev_level-_level));

            if(data.is_last_child===true){
                // unique + last
                ppre = ppre.replaceAt(_level*5,'\u2514');

            }else{
                // first + between
                ppre = ppre.replaceAt(_level*5,'\u251C');
            }
            ppre = ppre.replaceAt(_level*5+1,'\u2500\u2500');

            prev_level = _level;
            return ppre;
        }
        this.walk({
            itemCb:(data)=>{
                console.log(preFn(data)+data.item.base+(data.item.isDirectory?'/':'')); //,data.item.level, data.is_first_child, data.is_last_child);
            }
        });
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
            let _nw = [];
            excludedExtensions.forEach(function(v){
                _nw.push(_.escapeRegExp(v));
            });
            return new RegExp('('+_.join(_nw,'|')+')$');
        };

        const _wk = function(rootPath, absPath, options) {
            if(options.excludedPaths && options.excludedPaths.some((e) => e.test(absPath))) return null;

            let p_info = new PathInfo(absPath);
            if(p_info.error==true || (!p_info.isFile && !p_info.isDirectory)) return;
            p_info.rel_root = rootPath;

            if (p_info.isFile) {
                if (options.excludedExtensionsRegex && options.excludedExtensionsRegex.test(_.lowerCase(p_info.ext))) return null;
                options.itemCb(p_info);
                return p_info;
            }
            else if (p_info.isDirectory) {
                options.itemCb(p_info);

                Utils.File.readDirectorySync(absPath,(a)=>{
                    Utils.sortFilesArray(a);
                },(v,i,a)=>{
                    v = Utils.File.pathJoin(absPath,v);
                    let _pi = _wk(rootPath,v,options);
                    if(!_pi) return;
                    if(_pi.size) p_info.size += _pi.size;
                });

                options.afterDirectoryCb(p_info);
                return p_info;
            }
        };

        absPath = Utils.File.pathResolve(absPath)+Utils.File.pathSeparator;
        options.excludedPaths = _prepareExcludedPaths(options.excludedPaths);
        options.excludedExtensionsRegex = _prepareExcludedExtensions(options.excludedExtensions);
        _wk(absPath, absPath, options);
    }
}


module.exports = DirectoryTree;
