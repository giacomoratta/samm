const directory_tree = require('directory-tree');

const _prepareExcludedPaths = function(excludedPaths){
    // /some_path_to_exclude/
    if(!_.isArray(excludedPaths)) return null;
    let exclArray = [];
    excludedPaths.forEach(function(v){
        exclArray.push(_.escapeRegExp(v));
    });
    if(excludedPaths.length==0) return null;
    return exclArray;
};

const _prepareExcludedExtensions = function(excludedExtensions){
    //.*(sh|ini|jpg|vhost|xml|png)$  or  /\.txt$/
    if(!_.isArray(excludedExtensions)) return null;
    return '('+_.escapeRegExp(_.join(excludedExtensions,'|'))+')$';
};

class DirectoryTree {

    constructor(absPath,options){
        this._dt = null; /* Directory Tree */
        this._origin_path = null;

        options = _.merge({
            excludedExtensions:[],
            excludedPaths:[]
        },options);

        try{
            let dt = dirTree('./test/test_data', {
                exclude:_prepareExcludedPaths(options.excludedPaths),
                extensions:_prepareExcludedExtensions(options.excludedExtensions)
            }, (item, PATH) => {
                console.log(item);
            });
            if(!dt){
                this._dt=dt;
                this._origin_path=absPath;
            }

        }catch(e){
            d(e);
        }
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
