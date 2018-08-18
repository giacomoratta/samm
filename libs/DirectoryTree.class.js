const directory_tree = require('directory-tree');

const _prepareExcludedPaths = function(excludedPaths){
    return null; // /some_path_to_exclude/
};

const _prepareExcludedExtensions = function(excludedExtensions){
    return null; // /\.txt$/
};

class DirectoryTree {

    constructor(absPath,options){
        this._dt = null; /* Directory Tree */

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
            if(!dt) this._dt=dt;

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
