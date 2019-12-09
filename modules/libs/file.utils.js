const _ = require('./lodash')
const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')
const rimraf = require('rimraf') //A "rm -rf" util for nodejs
const iconv = require('iconv-lite')

const libUtils = {}

libUtils.pathBasename = path.basename

libUtils.pathExtname = path.extname

libUtils.pathDirname = path.dirname

libUtils.pathParse = path.parse

libUtils.pathJoin = path.join

libUtils.pathSeparator = path.sep


libUtils.setAsAbsPath = (rel_path, isFile, absPath) => {
    rel_path = _.trim(rel_path)
    //if(isFile===true && _.endsWith(rel_path,libUtils.pathSeparator)) rel_path=rel_path.substr(0,rel_path.length-1)
    if(!absPath) return path.resolve(rel_path)+(isFile!==true?libUtils.pathSeparator:'')
    return libUtils.pathJoin(absPath,rel_path,(isFile!==true?libUtils.pathSeparator:''))
}


libUtils.equalPaths = (p1,p2) => {
    p1 = _.toLower(libUtils.pathJoin(p1,libUtils.pathSeparator));
    p2 = _.toLower(libUtils.pathJoin(p2,libUtils.pathSeparator));
    if(p1.length >  p2.length) return p1.endsWith(p2);
    if(p1.length <= p2.length) return p2.endsWith(p1);
}




/* UTILS  - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.pathChangeFilename = (path_string,changeFn) => {
    let _pinfo = libUtils.pathParse(path_string);
    let _pinfo_name = changeFn(_pinfo.name,_pinfo);
    return libUtils.pathJoin(_pinfo.dir,_pinfo_name+_pinfo.ext);
}

libUtils.pathChangeDirname = (path_string,changeFn) => {
    let _pinfo = libUtils.pathParse(path_string);
    let _pinfo_base = changeFn(_pinfo.base,_pinfo);
    return libUtils.pathJoin(_pinfo.dir,_pinfo_base);
}




/* CHECKS  - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.isRelativePath = (p) => {
    return !libUtils.isAbsolutePath(p);
}

libUtils.isAbsolutePath = (p) => {
    return path.normalize(p + '/') === path.normalize(path.resolve(p) + '/');
}

libUtils.isAbsoluteParentDirSync = (path_string, check_exists) => {
    if(!_.isString(path_string)) return false;
    if(!path.isAbsolute(path_string)) return false;
    if(check_exists !== true) return true;
    let ps_dirname = libUtils.pathDirname(path_string);
    return libUtils.directoryExistsSync(ps_dirname);
}

libUtils.checkAndSetDuplicatedFileNameSync = (path_string, renameFn) => {
    if(!_.isFunction(renameFn)) renameFn = function(p_str,index){
        return libUtils.pathChangeFilename(p_str,function(old_name){
            return old_name+'_'+index;
        });
    };
    return _.noDuplicatedValues(null,path_string,(v,cv,i /*,a*/)=>{
        if(!fs.existsSync(cv)) return true; //found a free value
        cv = renameFn(v,i);
        //d$('checkAndSetDuplicatedFileNameSync ... changing '+v+' to '+cv);
        return cv;
    });
}

libUtils.checkAndSetDuplicatedDirectoryNameSync = (path_string, renameFn) => {
    if(!_.isFunction(renameFn)) renameFn = function(p_str,index){
        return libUtils.pathChangeDirname(p_str,function(old_name){
            return old_name+'_'+index;
        });
    };
    return _.noDuplicatedValues(null,path_string,(v,cv,i /*,a*/)=>{
        if(!fs.existsSync(cv)) return true; //found a free value
        cv = renameFn(v,i);
        //d$('checkAndSetDuplicatedDirectoryNameSync ... changing '+v+' to '+cv);
        return cv;
    });
}

libUtils.checkAndSetPathSync = (path_string,callback) => {
    if(!_.isString(path_string)) return null;
    if(!fs.existsSync(path_string)) return null;
    path_string = path.resolve(path_string)+libUtils.pathSeparator;
    if(callback) callback(path_string);
    return path_string;
}

libUtils.fileExistsSync = (path_string) => {
    if(!_.isString(path_string)) return false;
    return fs.existsSync(path_string);
}

libUtils.directoryExistsSync = (path_string) => {
    if(!_.isString(path_string)) return false;
    return fs.existsSync(path_string);
}




/* CHECKS  - ASYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.fileExists = (path_string) => {
    return new Promise(function(resolve){
        return resolve(libUtils.fileExistsSync(path_string));
    });
}

libUtils.directoryExists = (path_string) => {
    return new Promise(function(resolve){
        return resolve(libUtils.directoryExistsSync(path_string));
    });
}




/* PATH R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.getPathStatsSync = (path_string) => {
    // usage: isDirectory, isFile
    try{
        return fs.lstatSync(path_string);
    }catch(e){
        d$(e);
    }
}




/* FILE R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.readFileSync = (path_string, encoding, flag) => {
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
            return fs.readFileSync(path_string,{
                encoding:encoding,
                flag:flag
            });
        }
    }catch(e){
        d$(e);
        return false;
    }
}

libUtils.readJsonFileSync = (path_string) => {
    let file_content = libUtils.readFileSync(path_string,'iso88591');
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

libUtils.readTextFileSync = (path_string) => {
    let file_content = libUtils.readFileSync(path_string,'iso88591');
    if(file_content===false || _.isNil(file_content)) return false;
    return _.trim(file_content);
}

libUtils.writeFileSync = (path_string, file_content, encoding, flag, mode) => {
    try{
        if(!encoding) encoding='utf8';
        if(!flag) flag='w';
        if(!mode) mode=0o666;
        if(encoding==='iso88591'){
            file_content = iconv.decode(file_content, 'iso88591');
            fs.writeFileSync(path_string, file_content, {
                encoding:"binary",
                flag:flag,
                mode:mode
            });

        }else{
            fs.writeFileSync(path_string, file_content, {
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

libUtils.writeTextFileSync = (path_string, file_content) => {
    return libUtils.writeFileSync(path_string, file_content, 'iso88591');
}

libUtils.writeJsonFileSync = (path_string, json_obj, space) => {
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
    return libUtils.writeTextFileSync(path_string, file_content);
}




/* FILE R/W - ASYNC  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.writeTextFile = (path_to, text) => {
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



/* DIRECTORY R/W - ASYNC  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.copyDirectory = (path_from, path_to, options) => {
    options = _.merge({
        overwrite:false,
        errorOnExist:false
    },options);
    return new Promise(function(resolve,reject){
        let _ret_value = {
            err:null,
            path_from:path_from,
            path_to:path_to
        };
        fsExtra.copy(path_from, path_to, options, function(err){
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

libUtils.ensureDirSync = (path_string) => {
    try{
        fsExtra.ensureDirSync(path_string);
    }catch(e){
        return false;
    }
    return true;
}


libUtils.copyDirectorySync = (path_from, path_to, options) => {
    options = _.merge({
        overwrite:false,
        errorOnExist:false
    },options);
    let _ret_value = {
        err:null,
        path_from:path_from,
        path_to:path_to
    };
    try {
        fsExtra.copySync(path_from, path_to, options)
    } catch (err) {
        _ret_value.err = err;
        d$(_ret_value);
    }
    return _ret_value;
}


libUtils.moveDirectorySync = (path_from, path_to, options) => {
    options = _.merge({
        overwrite:false,
        setDirName:false,
        errorOnExist:false
    },options);
    if(options.setDirName===true){
        path_to = libUtils.pathJoin(path_to,libUtils.pathBasename(path_from));
    }
    let _ret_value = {
        err:null,
        path_from:path_from,
        path_to:path_to
    };

    try {
        fsExtra.moveSync(path_from, path_to, options)
    } catch (err) {
        _ret_value.err = err;
        d$(_ret_value);
    }
    return _ret_value;
}


libUtils.readDirectorySync = (path_string,preFn,callback) => {
    if(!callback) callback=function(){};
    if(!preFn) preFn=function(){};
    let items = null;
    try{
        items = fs.readdirSync(path_string);
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


libUtils.removeDirSync = (path_string) => {
    try{
        return rimraf.sync(path_string);
    }catch(e){
        d$(e.message);
    }
}




/* FileSystem R/W - SYNC   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

libUtils.removeFileSync = (path_string) => {
    try{
        return fs.unlinkSync(path_string);
    }catch(e){
        d$(e.message);
    }
}


libUtils.copyFileSync = (path_from, path_to, options) => {
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
        fsExtra.copySync(path_from, path_to, options)
    } catch (err) {
        _ret_value.err = err;
        d$(_ret_value);
    }
    return _ret_value;
}


libUtils.copyFile = (path_from, path_to, options) => {
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
        fsExtra.copy(path_from, path_to, options, function(err){
            if(err){
                _ret_value.err = err;
                d$(_ret_value);
                return reject(_ret_value);
            }
            return resolve(_ret_value);
        });
    });
}

module.exports = libUtils
