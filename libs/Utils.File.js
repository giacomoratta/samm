const path = require('path');
const fs = require('fs');
const fs_extra = require('fs-extra');
const rimraf = require('rimraf'); //A "rm -rf" util for nodejs
const _ = require('lodash');
// function d(){ ...print debug msg... }

class Utils_Files {

    constructor(){
        this._console = console.log;
        this._PATH = path;
        this._FS = fs;
        this._FS_EXTRA = fs_extra;
        this._RIMRAF = rimraf;
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
        rel_path = _.trim(rel_path);
        if(isFile===true && _.endsWith(rel_path,Utils.File.pathSeparator)) rel_path=rel_path.substr(0,rel_path.length-1);
        return Utils.File.pathJoin(this.getAbsPath(),rel_path,(isFile!==true?Utils.File.pathSeparator:''));
    }



    /* CHECKS  - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    isAbsoluteParentDirSync(path_string, check_exists){
        if(!_.isString(path_string)) return false;
        if(!this._PATH.isAbsolute(path_string)) return false;
        if(check_exists !== true) return true;
        let ps_dirname = this.pathDirname(path_string);
        return this.directoryExistsSync(ps_dirname);
    }

    checkAndSetDuplicatedDirectoryNameSync(path_string){
        if(!_.isString(path_string)) return null;
        if(!this._FS.existsSync(path_string)) return path_string;

        let _safe=1000;
        let new_path_string='';
        let prefix=0;
        while(_safe>prefix){
            prefix++;
            new_path_string = path_string+'_'+prefix;
            if(!this._FS.existsSync(new_path_string)) return new_path_string;
        }
        return null;
    }

    checkAndSetPathSync(path_string,callback){
        if(!_.isString(path_string)) return null;
        if(!this._FS.existsSync(path_string)) return null;
        path_string = this.pathResolve(path_string)+Utils.File.pathSeparator;
        if(callback) callback(path_string);
        return path_string;
    }

    fileExistsSync(path_string){
        if(!_.isString(path_string)) return false;
        if(!this._FS.existsSync(path_string)) return false;
        return true;
    }

    directoryExistsSync(path_string){
        if(!_.isString(path_string)) return false;
        if(!this._FS.existsSync(path_string)) return false;
        return true;
    }




    /* PATH R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    getPathStatsSync(path_string){
        // usage: isDirectory, isFile
        try{
            return this._FS.lstatSync(path_string);
        }catch(e){
            d(e);
        }
    }




    /* FILE R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    readFileSync(path_string, encoding, flag){
        try{
            if(!encoding) encoding='utf8';
            if(!flag) flag='r';
            return this._FS.readFileSync(path_string,{
                encoding:encoding,
                flag:flag
            });
        }catch(e){
            d(e);
            return false;
        }
    }

    readJsonFileSync(path_string){
        let file_content = this.readFileSync(path_string,'utf8');
        if(file_content === false) return false;
        try{
            let json_obj = JSON.parse(file_content);
            if(!_.isObject(json_obj)) return null;
            return json_obj;
        }catch(e){
            d(e);
            return null;
        }
    }

    readTextFileSync(path_string){
        let file_content = this.readFileSync(path_string,'utf8');
        if(file_content === false) return false;
        return _.trim(file_content);
    }

    writeFileSync(path_string, file_content, encoding, flag, mode){
        try{
            if(!encoding) encoding='utf8';
            if(!flag) flag='w';
            if(!mode) mode=0o666;
            this._FS.writeFileSync(path_string, file_content, {
                encoding:encoding,
                flag:flag,
                mode:mode
            });
            return true;
        }catch(e){
            d(e);
            return false;
        }
    }

    writeTextFileSync(path_string, file_content){
        return this.writeFileSync(path_string, file_content, 'utf8');
    }

    writeJsonFileSync(path_string, json_obj, space){
        if(!_.isObject(json_obj)) return false;

        if(space===false) space=null;
        else space='\t';

        let file_content = '';
        try{
            file_content = JSON.stringify(json_obj, null, space);
        }catch(e){
            d(e);
            return false;
        }
        return this.writeTextFileSync(path_string,file_content);
    }




    /* FILE R/W - ASYNC  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    writeTextFile(path_to, text){
        const _self = this;
        return new Promise(function(resolve,reject){
            let _ret_value = {
                err:null,
                path_to:path_to
            };
            _self._FS.writeFile(path_to, text, 'utf8',function(err){
                if(err){
                    _ret_value.err = err;
                    return reject(_ret_value);
                }
                return resolve(_ret_value);
            });
        });
    }




    /* DIRECTORY R/W - SYNC  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    ensureDirSync(path_string){
        this._FS_EXTRA.ensureDirSync(path_string);
    }

    readDirectorySync(path_string,preFn,callback){
        if(!callback) callback=function(){};
        if(!preFn) preFn=function(){};
        let items = null;
        try{
            items = this._FS.readdirSync(path_string);
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

    removeDirSync(path_string){
        return this._RIMRAF.sync(path_string);
    }




    /* FileSystem R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

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
            this._FS_EXTRA.copySync(path_from, path_to, options)
        } catch (err) {
            _ret_value.err = err;
            _self._console(_ret_value);
        }
        return _ret_value;
    }

    copyFile(path_from, path_to, options){
        //console.log(path_from, path_to, options);
        //return new Promise(function(){},function(){});

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
            _self._FS_EXTRA.copy(path_from, path_to, options, function(err){
                if(err){
                    _ret_value.err = err;
                    _self._console(_ret_value);
                    return reject(_ret_value);
                }
                return resolve(_ret_value);
            });
        });
    }


}

module.exports = new Utils_Files();
