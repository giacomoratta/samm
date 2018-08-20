const SymbolTree = require('symbol-tree');

class DirectoryTree {

    constructor(absPath,options){

        this._dt = null; /* Directory Tree */
        this._root_path = absPath;
        this._tree = null;
        this._root = {}; //empty root

        this._stats = {
            files_count:0,
            directories_count:0
        };

        options = _.merge({
            excludedExtensions:[],
            excludedPaths:[],
            itemCb:function(){},
            afterDirectoryCb:function(){}
        },options);

        let _tree = new SymbolTree();
        let _t_parent = this._root;

        Utils.File.walkDirectory(this._root_path,{
            excludedExtensions:options.excludedExtensions,
            excludedPaths:options.excludedPaths,
            itemCb:(item)=>{
                // callback for each item
                if(item.isFile===true){
                    _tree.appendChild(_t_parent,item);
                    this._stats.files_count++;
                }
                else if(item.isDirectory===true){
                    _t_parent = _tree.appendChild(_t_parent,item);
                    this._stats.directories_count++;
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
        return (this._stats.files_count==0 && this._stats.directories_count==0);
    }


    size(){
        return (this._stats.files_count+this._stats.directories_count);
    }


    getRootPath(){
        return this._root_path;
    }


    toJsonString(){
    }


    fromJsonString(json_string){
    }
}

module.exports = DirectoryTree;
