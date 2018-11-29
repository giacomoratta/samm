class ProjectsTemplate {

    constructor(){
        this._data = [];
        this._size = 0;
    }

    get dir() { return ConfigMgr.path('templates_path'); }

    _checkAndSetStructure(){
        let _dirFound = [];
        DirectoryTree.walkDirectory(ConfigMgr.path('templates_path'),{
            maxLevel:2,
            itemCb:function(data){
                if(!data.item.isDirectory) return;
                if(data.item.level!==2) return;
                _dirFound.push(data.item.path);
            }
        });
        let _self = this;
        let _pathsToBeRemoved = [];

        /* Checks if stored directories exist for real */
        this._data.forEach(function(v1){
            let flag=false;
            _dirFound.forEach(function(v2){
                if(Utils.File.equalPaths(v1.path,v2)) flag=true;
            });
            if(!flag) _pathsToBeRemoved.push(v1.path);
        });
        _pathsToBeRemoved.forEach(function(p){ _self._remove(p); });

        /* Inserts real directories if they are not present in the json */
        _dirFound.forEach(function(v){
            let i = _self.getIndex(v);
            if(i>=0) return;
            _self._add(v,Utils.File.pathBasename(v));
        });
    }

    _newTemplateNode(path,base){
        return {
            path:path,
            base:base
        }
    }

    empty(){
        return (this._size===0);
    }

    size(){
        return this._size;
    }

    get(index){
        if(_.isString(index)) return this._getByBase(index);
        if(this._size<1) return null;
        if(!_.isInteger(index)) return null;
        else if(index===-1) index=this._size-1;
        else if(index>this._size-1) return null;
        return this._data[index].path;
    }

    _getByBase(base){
        if(this.empty()) return null;
        for(let i=0; i<this._data.length; i++){
            if(this._data[i].base===base) return this._data[i].path;
        }
        return null;
    }

    getIndex(template_path){
        template_path = _.toLower(template_path);
        for(let i=0; i<this._data.length; i++){
            if(Utils.File.equalPaths(this._data[i].path,template_path)){
                return i;
            }
        }
        return -1;
    }


    _add(template_path,template_name){
        this._data.unshift(this._newTemplateNode(template_path,template_name));
        this._size = this._data.length;
    }


    _remove(template_path){
        let index = this.getIndex(template_path);
        if(index>=0) {
            this._data.splice(index,1);
            this._size = this._data.length;
        }
        return index;
    }


    remove(template_path){
        let flag = (this._remove(template_path)>=0);
        if(Utils.File.removeDirSync(template_path)===true){
            flag = true;
        }
        return flag;
    }


    printIndexedList(printFn){
        printFn('');
        printFn('Available templates:');
        for(let i=0; i<this._data.length; i++){
            printFn('  ' + (i+1) + ') ' + this._data[i].path);
        }
        printFn('');
        return this._data.length>0;
    }


    forEach(cb){
        for(let i=0; i<this._data.length; i++){
            cb(this._data[i],i);
        }
    }


    fromJson(jsondata){
        if(!_.isObject(jsondata)) return false;
        this._checkAndSetStructure();
        this._data = [];
        this._size = jsondata.size;
        jsondata.collection.forEach((value)=>{
            this._data.push(this._newTemplateNode(value.path,value.base));
        });
        return true;
    }


    toJson(){
        this._checkAndSetStructure();
        return {
            size:this._size,
            collection:this._data
        };
    }


    add(template_name, origin_path){
        let _self = this;
        return new Promise(function(resolve,reject){
            if(!_.isString(template_name)) return reject({ message:'wrong template name' });
            if(!Utils.File.directoryExistsSync(ConfigMgr.path('templates_path'))) return reject({ message:'template path does not exist '+ConfigMgr.path('templates_path') });
            if(!Utils.File.directoryExistsSync(origin_path)) return reject({ message:'original project path does not exist '+origin_path });
            template_name = Utils.onlyValidPathName(template_name);
            if(template_name.length<1) return reject({ message:'wrong template name' });

            let template_path = Utils.File.pathJoin(ConfigMgr.path('templates_path'),template_name);
            template_path = Utils.File.checkAndSetDuplicatedDirectoryNameSync(template_path);

            template_name = Utils.File.pathBasename(template_path);
            _self.remove(template_path);
            Utils.File.copyDirectory(origin_path,template_path).then(()=>{
                _self._add(template_path,template_name);
                resolve({
                    template_path: template_path
                });
            }).catch((e)=>{
                d$(e);
                return reject({ message:'Cannot duplicate the template as new project '+origin_path+' --> '+template_path });
            });
        });
    }


    _newProjectName(project_name){
        let project_np = ConfigMgr.get('ProjectNamePattern');
        if(project_np.length<=0) return project_name;
        let new_project_name = Utils.replaceAll(project_np,'<name>',project_name);
        if(new_project_name.length<=0) return project_name;
        return new_project_name;
    }

    _newRenameFn(project_parent_path, project_name){
        let _self = this;
        return function(p_str,index){
            return Utils.File.pathJoin(project_parent_path,_self._newProjectName(project_name+(!_.isInteger(index)?'':'_'+index)));
        };
    }


    newProject(template_path, project_parent_path, project_name){
        let _self = this;
        return new Promise(function(resolve,reject){

            /* TEMPLATE PATH */
            if(!Utils.File.directoryExistsSync(template_path)){
                reject({
                    message:'Template path does not exist: '+template_path
                });
            }

            /* PROJECT PARENT PATH */
            //Utils.File.ensureDirSync(project_parent_path);
            if(!Utils.File.directoryExistsSync(project_parent_path)){
                reject({
                    message:'Project parent path does not exist: '+project_parent_path
                });
            }

            /* PROJECT PATH - no duplication */
            let project_path_fn = _self._newRenameFn(project_parent_path,project_name);
            let project_path = project_path_fn();
            project_path = Utils.File.checkAndSetDuplicatedDirectoryNameSync(project_path,project_path_fn);

            /* COPY PROJECT */
            Utils.File.copyDirectory(template_path,project_path).then(()=>{
                if(!Utils.File.directoryExistsSync(project_path)){
                    reject({
                        message:'Project not created '+template_path+' --> '+project_path
                    });
                }
                resolve({
                    project_path: project_path
                });
            }).catch((e)=>{
                d$(e);
                reject({
                    message:'Cannot duplicate the template as new project '+template_path+' --> '+project_path
                });
            })
        });
    }
}

module.exports = ProjectsTemplate;
