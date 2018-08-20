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

        let x = new SymbolTree();
        let t = x.initialize({});
                console.log(t);return;

        Utils.File.walkDirectory(this._root_path,{
            nodeCallback:(item)=>{
                // callback for each item
                if(item.isFile===true) t.appendChild(item);
                if(item.isDirectory===true) t=t.addChild(item)
            },
            afterDirectoryCallback:(item)=>{
                // callback after reading directory
                t = t.parent;
            }
        });
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
