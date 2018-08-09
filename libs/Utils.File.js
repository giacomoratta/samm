
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

    directoryExists(path_string){
        if(!_.isString(path_string)) return false;
        if(!fs.existsSync(path_string)) return false;
        return true;
    }

    copyFileSync(path_from, path_to, options){
        options = _.merge({
            overwrite:true,
            errorOnExist:false
        },options);
        let _ret_value = {
            err:null,
            path_from:path_from,
            path_to:path_to
        };
        try {
            fs_extra.copySync(path_from, path_to, options)
        } catch (err) {
            _ret_value.err = err;
            this._console(_ret_value);
        }
        return _ret_value;
    }

    copyFile(path_from, path_to, options){
        options = _.merge({
            overwrite:true,
            errorOnExist:false
        },options);
        return new Promise(function(resolve,reject){
            let _ret_value = {
                err:null,
                path_from:path_from,
                path_to:path_to
            };
            fs_extra.copy(path_from, path_to, options, function(err){
                if(err){
                    _ret_value.err = err;
                    this._console(_ret_value);
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
