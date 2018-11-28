class ProjectsTemplate {

    constructor(templates_path){
        this.templates_path = templates_path;
        this._data = [];
        this._size = 0;

        // TODO: try to fill
    }

    get dir() { return this.templates_path; }

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
        if(this._size<1) return null;
        if(!_.isInteger(index)) return null;
        else if(index===-1) index=this._size-1;
        else if(index>this._size-1) return null;
        return this._data[index].path;
    }

    getIndex(template_path){
        template_path = _.toLower(template_path);
        for(let i=0; i<this._data.length; i++){
            if(_.toLower(this._data[i].path) === template_path){
                return i;
            }
        }
        return -1;
    }

    remove(template_path){
        let index = this.getIndex(template_path);
        if(index<0) return false;
        this._data.splice(index,1);
        return Utils.File.removeDirSync(template_path);
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
        this._data = [];
        this._size = jsondata.size;
        jsondata.collection.forEach((value,index)=>{
            this._data.push(this._newTemplateNode(value.path,value.base));
        });
        return true;
    }


    toJson(){
        return {
            size:this._size,
            collection:this._data
        };
    }


    add(template_name, origin_path){
        let _self = this;
        return new Promise(function(resolve,reject){
            if(!_.isString(template_name)) return reject({ message:'wrong template name' });
            if(!Utils.File.directoryExistsSync(_self.templates_path)) return reject({ message:'template path does not exist '+_self.templates_path });
            if(!Utils.File.directoryExistsSync(origin_path)) return reject({ message:'original project path does not exist '+origin_path });
            template_name = Utils.onlyValidPathName(template_name);
            if(template_name.length<1) return reject({ message:'wrong template name' });

            let template_path = Utils.File.pathJoin(_self.templates_path,template_name);
            template_path = Utils.File.checkAndSetDuplicatedDirectoryNameSync(template_path);

            template_name = Utils.File.pathBasename(template_path);
            _self.remove(template_path);
            Utils.File.copyDirectory(origin_path,template_path).then(()=>{
                _self._data.unshift(_self._newTemplateNode(template_path,template_name));
                _self._size = _self._data.length;
                resolve({
                    template_path: template_path
                });
            }).catch((e)=>{
                d$(e);
                return reject({ message:'Cannot duplicate the template as new project '+origin_path+' --> '+template_path });
            });
        });
    }


    newProject(template_path, project_parent_path, project_name){
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
            let project_path = Utils.File.pathJoin(project_parent_path,project_name);
            project_path = Utils.File.checkAndSetDuplicatedDirectoryNameSync(project_path);

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