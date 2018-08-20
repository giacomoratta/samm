const path = require('path');
const fs = require('fs');
const fs_extra = require('fs-extra');

class Utils_Files {

    constructor(){
        this._console = console.log;
        this._path = path;
        this._fs = fs;
        this._fs_extra = fs_extra;
        //this._console = function(){};

        this.pathBasename = path.basename;
        this.pathDirname = path.dirname;
        this.pathParse = path.parse;
        this.pathJoin = path.join;
        this.pathResolve = path.resolve;
        this.pathSeparator = path.sep;

        this._abspath = this.pathJoin(process.cwd(),this.pathSeparator);
    }

    getAbsPath(){
        return this._abspath;
    }

    setAsAbsPath(rel_path, isFile){
        return Utils.File.pathJoin(this.getAbsPath(),rel_path,(isFile!==true?Utils.File.pathSeparator:''));
    }

    checkAndSetDirectoryName(path_string){
        if(!_.isString(path_string)) return null;
        if(!fs.existsSync(path_string)) return path_string;

        let _safe=1000;
        let new_path_string='';
        let prefix=1;
        while(_safe>prefix){
            prefix++;
            new_path_string = path_string+'_'+prefix;
            if(!fs.existsSync(new_path_string)) return new_path_string;
        }
        return null;
    }

    checkAndSetPath(path_string,callback){
        if(!_.isString(path_string)) return null;
        if(!fs.existsSync(path_string)) return null;
        path_string = this.pathResolve(path_string)+Utils.File.pathSeparator;
        if(callback) callback(path_string);
        return path_string;
    }

    fileExists(path_string){
        if(!_.isString(path_string)) return false;
        if(!fs.existsSync(path_string)) return false;
        return true;
    }

    directoryExists(path_string){
        if(!_.isString(path_string)) return false;
        if(!fs.existsSync(path_string)) return false;
        return true;
    }


    ensureDirSync(path_string){
        fs_extra.ensureDirSync(path_string);
    }


    readFileSync(path_string){
        try{
            return fs.readFileSync(path_string,'utf8');
        }catch(e){
            console.log(e);
            return false;
        }
    }


    writeFileSync(path_string, content_string){
        try{
            fs.writeFileSync(path_string, content_string, 'utf8');
            return true;
        }catch(e){
            console.log(e);
            return false;
        }
    }


    readDirectorySync(path_string,preFn,callback){
        if(!callback) callback=function(){};
        if(!preFn) preFn=function(){};
        let items = null;
        try{
            items = this._fs.readdirSync(path_string);
        }catch(e){
            d(e);
            return null;
        }
        if(!items) return null;
        preFn(items);
        for (let i=0; i<items.length; i++) {
            callback(items[i],i,items);
        }
        return items;
    }

    getPathStatsSync(path_string){
        // usage: isDirectory, isFile
        return fs.lstatSync(path_string);
    }

    copyFileSync(path_from, path_to, options){
        options = _.merge({
            overwrite:true,
            errorOnExist:false
        },options);
        let _self = this;
        let _ret_value = {
            err:null,
            path_from:path_from,
            path_to:path_to
        };
        try {
            fs_extra.copySync(path_from, path_to, options)
        } catch (err) {
            _ret_value.err = err;
            _self._console(_ret_value);
        }
        return _ret_value;
    }

    copyFile(path_from, path_to, options){
        options = _.merge({
            overwrite:true,
            errorOnExist:false
        },options);
        let _self = this;
        return new Promise(function(resolve,reject){
            let _ret_value = {
                err:null,
                path_from:path_from,
                path_to:path_to
            };
            fs_extra.copy(path_from, path_to, options, function(err){
                if(err){
                    _ret_value.err = err;
                    _self._console(_ret_value);
                    return reject(_ret_value);
                }
                return resolve(_ret_value);
            });
        });
    }

    writeTextFile(path_to, text){
        return new Promise(function(resolve,reject){
            let _ret_value = {
                err:null,
                path_to:path_to
            };
            fs.writeFile(path_to, text, 'utf8',function(err){
                if(err){
                    _ret_value.err = err;
                    return reject(_ret_value);
                }
                return resolve(_ret_value);
            });
        });
    }


    walkDirectory(absPath, options){
        const _self = this;

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

        	let stats = _self.getPathStatsSync(absPath);
            if(!stats || (!stats.isFile() && !stats.isDirectory())) return;

            let p_info = _self.pathParse(absPath);
            p_info.path = absPath;

        	if (stats.isFile()) {
        		if (O.excludedExtensions && O.excludedExtensions.test(_.lowerCase(p_info.ext))) return null;

        		p_info.size = stats.size;  // bytes
        		p_info.isFile = true;
        		O.nodeCallback(p_info);
                return p_info;
        	}
        	else if (stats.isDirectory()) {
                p_info.isDirectory = true;
                O.nodeCallback(p_info);
                p_info.size = 0;

                _self.readDirectorySync(absPath,(a)=>{
                    Utils.sortFilesArray(a);
                },(v,i,a)=>{
                    v = _self.pathJoin(absPath,v);
                    let _pi = _wk(v,O);
                    if(_pi.size) p_info.size += _pi.size;
                });

                O.afterDirectoryCallback(p_info);
                return p_info;
        	}
        };

        options.excludedPaths = _prepareExcludedPaths(options.excludedPaths),
        options.excludedExtensions = _prepareExcludedExtensions(options.excludedExtensions)

        _wk(absPath, options);

    }
}

module.exports = new Utils_Files();
