
class Utils_Files {

    constructor(){
        this._console = console.log;
        //this._console = function(){};
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
        path_string = path.resolve(path_string)+path.sep;
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
            let items = fs.readdirSync(path_string);
        }catch(e){
            return null;
        }
        if(!items) return null;
        preFn(items);
        for (let i=0; i<items.length; i++) {
            callback(item[i],i,items);
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
}

module.exports = new Utils_Files();
