const SymbolTree = require('symbol-tree');

class DirectoryTree {

    constructor(absPath,options){

        this._dt = null; /* Directory Tree */
        this._root_path = absPath;
        this._tree = null;

        options = _.merge({
            excludedExtensions:[],
            excludedPaths:[]
        },options);

        let _tree = new SymbolTree();
        let _t_parent = {};

        // let v = _tree.appendChild(_t_parent,{ehi:true});
        // console.log(v);
        //  v = _tree.appendChild(_t_parent,v);
        // console.log(v);
        //
        // return;

        Utils.File.walkDirectory(this._root_path,{
            nodeCallback:(item)=>{
                // callback for each item
                if(item.isFile===true){
                    _tree.appendChild(_t_parent,item);
                }
                else if(item.isDirectory===true){
                    _t_parent = _tree.appendChild(_t_parent,item);
                }
            },
            afterDirectoryCallback:(item)=>{
                // callback after reading directory
                _t_parent = _tree.parent(item);
            }
        });

        let _x_parent = _tree.firstChild(_t_parent);
        let level = -1;
        let prev_index = 0;

        const iterator = _tree.treeIterator(_x_parent);
        for (const object of iterator) {

            _x_parent = _tree.parent(object);

            let isFirst = (_tree.firstChild(_x_parent)===object);
            let isLast = (_tree.lastChild(_x_parent)===object);

            if((_tree.index(object)-prev_index)==1){

            }else if(_tree.index(object)==0){
                level++;
            }else{
                level--;
            }
            prev_index = _tree.index(object);

            console.log(level,' - ',isFirst,isLast,_tree.index(object),object.path);



            //console.log(_tree.firstChild);
            //console.log(object.path);



        }

        return;

        // const iterator = _tree.treeIterator(_t_parent);
        // for (const object of iterator) {
        //     console.log(object.path);
        // }

    }

    empty(){
    }


    size(){
    }


    getOriginPath(){
    }


    toJsonString(){
    }


    fromJsonString(json_string){
    }
}

module.exports = DirectoryTree;
