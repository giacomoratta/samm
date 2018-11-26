let Projects = require('../libs/Projects.class');

class ProjectsManager {

    constructor(){
        this._createBookmarksHolder();
        this.projectsObj = null;
    }


    printIndexedList(printFn){
        return this.projectsObj.printIndexedList(printFn);
    }


    getCurrent(){
        return this.projectsObj.get(0);
    }


    setCurrent(project_path){
        return this.projectsObj.add(project_path);
    }


    setCurrentByIndex(index){
        return this.projectsObj.get(index);
    }


    save(){
        return DataMgr.save('projects');
    }


    _createBookmarksHolder(){
        let _self = this;
        return DataMgr.setHolder({
            label:'projects',
            filePath:ConfigMgr.path('projects'),
            fileType:'json',
            dataType:'object',
            logErrorsFn:d$,
            preLoad:true,

            initFn:()=>{
                return new Projects();
            },

            loadFn:(fileData)=>{
                _self.projectsObj = new Projects();
                if(!_.isObject(fileData)){
                    return _self.projectsObj;
                }
                _self.projectsObj.fromJson(fileData);
                return _self.projectsObj;
            },

            saveFn:(projectsObj)=>{
                return projectsObj.toJson();
            }
        });
    }

}

module.exports = new ProjectsManager();
