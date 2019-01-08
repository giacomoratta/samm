const path = require('path');
const fs = require('fs');
const fs_extra = require('fs-extra');
const rimraf = require('rimraf'); //A "rm -rf" util for nodejs
const _ = require('lodash');
const iconv = require('iconv-lite');

class Utils_Files {

    constructor(){
        this._PATH = path;
        this._FS = fs;
        this._FS_EXTRA = fs_extra;
        this._RIMRAF = rimraf;

        this.pathBasename = path.basename;
        this.pathExtname = path.extname;
        this.pathDirname = path.dirname;
        this.pathParse = path.parse;
        this.pathJoin = path.join;
        this.pathResolve = path.resolve;
        this.pathSeparator = path.sep;
        this._abspath = './';

        if(typeof ENV_CONFIG === 'undefined') return; // Workaround: nexe does not find this global
        this._abspath = this._setAbsPath();
    }

    _setAbsPath(){
        let abspth = ENV_CONFIG.absolute_app_path;
        if(fs.lstatSync(abspth).isFile()){
            abspth = path.dirname(abspth);
            ENV_CONFIG.absolute_app_path = abspth;
        }
        return this.pathJoin(abspth,this.pathSeparator);
    }

    getAbsPath(){
        return this._abspath;
    }

    setAsAbsPath(rel_path, isFile, absPath){
        rel_path = _.trim(rel_path);
        if(isFile===true && _.endsWith(rel_path,Utils.File.pathSeparator)) rel_path=rel_path.substr(0,rel_path.length-1);
        if(!absPath) absPath=this.getAbsPath();
        return Utils.File.pathJoin(absPath,rel_path,(isFile!==true?Utils.File.pathSeparator:''));
    }

    equalPaths(p1,p2){
        p1 = _.toLower(this.pathJoin(p1,this.pathSeparator));
        p2 = _.toLower(this.pathJoin(p2,this.pathSeparator));
        if(p1.length >  p2.length) return p1.endsWith(p2);
        if(p1.length <= p2.length) return p2.endsWith(p1);
    }



    /* UTILS  - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    pathChangeFilename(path_string,changeFn){
        let _pinfo = this.pathParse(path_string);
        let _pinfo_name = changeFn(_pinfo.name,_pinfo);
        return this.pathJoin(_pinfo.dir,_pinfo_name+_pinfo.ext);
    }

    pathChangeDirname(path_string,changeFn){
        let _pinfo = this.pathParse(path_string);
        let _pinfo_base = changeFn(_pinfo.base,_pinfo);
        return this.pathJoin(_pinfo.dir,_pinfo_base);
    }




    /* CHECKS  - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    isRelativePath(p){
        return !this.isAbsolutePath(p);
    }

    isAbsolutePath(p){
        return this._PATH.normalize(p + '/') === this._PATH.normalize(this._PATH.resolve(p) + '/');
    }

    isAbsoluteParentDirSync(path_string, check_exists){
        if(!_.isString(path_string)) return false;
        if(!this._PATH.isAbsolute(path_string)) return false;
        if(check_exists !== true) return true;
        let ps_dirname = this.pathDirname(path_string);
        return this.directoryExistsSync(ps_dirname);
    }

    checkAndSetDuplicatedFileNameSync(path_string, renameFn){
        const _self = this;
        if(!_.isFunction(renameFn)) renameFn = function(p_str,index){
            return _self.pathChangeFilename(p_str,function(old_name){
                return old_name+'_'+index;
            });
        };
        return _.noDuplicatedValues(null,path_string,(v,cv,i /*,a*/)=>{
            if(!this._FS.existsSync(cv)) return true; //found a free value
            cv = renameFn(v,i);
            //d$('checkAndSetDuplicatedFileNameSync ... changing '+v+' to '+cv);
            return cv;
        });
    }

    checkAndSetDuplicatedDirectoryNameSync(path_string, renameFn){
        const _self = this;
        if(!_.isFunction(renameFn)) renameFn = function(p_str,index){
            return _self.pathChangeDirname(p_str,function(old_name){
                return old_name+'_'+index;
            });
        };
        return _.noDuplicatedValues(null,path_string,(v,cv,i /*,a*/)=>{
            if(!this._FS.existsSync(cv)) return true; //found a free value
            cv = renameFn(v,i);
            //d$('checkAndSetDuplicatedDirectoryNameSync ... changing '+v+' to '+cv);
            return cv;
        });
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
        return this._FS.existsSync(path_string);
    }

    directoryExistsSync(path_string){
        if(!_.isString(path_string)) return false;
        return this._FS.existsSync(path_string);
    }




    /* CHECKS  - ASYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    fileExists(path_string){
        let _self = this;
        return new Promise(function(resolve,reject){
            return resolve(_self.fileExistsSync(path_string));
        });
    }

    directoryExists(path_string){
        let _self = this;
        return new Promise(function(resolve,reject){
            return resolve(_self.directoryExistsSync(path_string));
        });
    }




    /* PATH R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    getPathStatsSync(path_string){
        // usage: isDirectory, isFile
        try{
            return this._FS.lstatSync(path_string);
        }catch(e){
            d$(e);
        }
    }




    /* FILE R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    readFileSync(path_string, encoding, flag){
        try{
            if(!encoding) encoding='utf8';
            if(!flag) flag='r';
            if(encoding==='iso88591'){
                let fcont = fs.readFileSync(path_string,{
                    encoding:'binary',
                    flag:flag
                }).toString();
                return iconv.decode(fcont, 'iso88591');
            }else{
                return this._FS.readFileSync(path_string,{
                    encoding:encoding,
                    flag:flag
                });
            }
        }catch(e){
            d$(e);
            return false;
        }
    }

    readJsonFileSync(path_string){
        let file_content = this.readFileSync(path_string,'iso88591');
        if(!_.isString(file_content)) return false;
        try{
            let json_obj = JSON.parse(file_content);
            if(!_.isObject(json_obj)) return null;
            return json_obj;
        }catch(e){
            d$(e);
            return null;
        }
    }

    readTextFileSync(path_string){
        let file_content = this.readFileSync(path_string,'iso88591');
        if(file_content===false || _.isNil(file_content)) return false;
        return _.trim(file_content);
    }

    writeFileSync(path_string, file_content, encoding, flag, mode){
        try{
            if(!encoding) encoding='utf8';
            if(!flag) flag='w';
            if(!mode) mode=0o666;
            if(encoding==='iso88591'){
                file_content = iconv.decode(file_content, 'iso88591');
                this._FS.writeFileSync(path_string, file_content, {
                    encoding:"binary",
                    flag:flag,
                    mode:mode
                });

            }else{
                this._FS.writeFileSync(path_string, file_content, {
                    encoding:encoding,
                    flag:flag,
                    mode:mode
                });
            }
            return true;
        }catch(e){
            d$(e);
            return false;
        }
    }

    writeTextFileSync(path_string, file_content){
        return this.writeFileSync(path_string, file_content, 'iso88591');
    }

    writeJsonFileSync(path_string, json_obj, space){
        if(!_.isObject(json_obj)) return false;

        if(space===false) space=null;
        else space="\t";

        let file_content = '';
        try{
            file_content = JSON.stringify(json_obj, null, space);
        }catch(e){
            d$(e);
            return false;
        }
        return this.writeTextFileSync(path_string, file_content);
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



    /* DIRECTORY R/W - ASYNC  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    copyDirectory(path_from, path_to, options){
        options = _.merge({
            overwrite:false,
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
                    d$(_ret_value);
                    return reject(_ret_value);
                }
                return resolve(_ret_value);
            });
        });
    }




    /* DIRECTORY R/W - SYNC  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    ensureDirSync(path_string){
        try{
            this._FS_EXTRA.ensureDirSync(path_string);
        }catch(e){
            return false;
        }
        return true;
    }


    copyDirectorySync(path_from, path_to, options){
        options = _.merge({
            overwrite:false,
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
            d$(_ret_value);
        }
        return _ret_value;
    }


    moveDirectorySync(path_from, path_to, options){
        options = _.merge({
            overwrite:false,
            setDirName:false,
            errorOnExist:false
        },options);
        if(options.setDirName===true){
            path_to = this.pathJoin(path_to,this.pathBasename(path_from));
        }
        let _self = this;
        let _ret_value = {
            err:null,
            path_from:path_from,
            path_to:path_to
        };

        try {
            this._FS_EXTRA.moveSync(path_from, path_to, options)
        } catch (err) {
            _ret_value.err = err;
            d$(_ret_value);
        }
        return _ret_value;
    }


    readDirectorySync(path_string,preFn,callback){
        if(!callback) callback=function(){};
        if(!preFn) preFn=function(){};
        let items = null;
        try{
            items = this._FS.readdirSync(path_string);
        }catch(e){
            d$(e);
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
        try{
            return this._RIMRAF.sync(path_string);
        }catch(e){
            d$(e.message);
        }
    }




    /* FileSystem R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    removeFileSync(path_string){
        try{
            return this._FS.unlinkSync(path_string);
        }catch(e){
            d$(e.message);
        }
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
            this._FS_EXTRA.copySync(path_from, path_to, options)
        } catch (err) {
            _ret_value.err = err;
            d$(_ret_value);
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
            _self._FS_EXTRA.copy(path_from, path_to, options, function(err){
                if(err){
                    _ret_value.err = err;
                    d$(_ret_value);
                    return reject(_ret_value);
                }
                return resolve(_ret_value);
            });
        });
    }

}

module.exports = new Utils_Files();
