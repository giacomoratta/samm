let ProjectsHistory = require('./submodules/ProjectsHistory.class');
let ProjectsTemplate = require('./submodules/ProjectsTemplate.class');
let ProjectsPath = require('./submodules/ProjectsPath.class');

class ProjectsManager {

    constructor(){
        this._data = {
            history:null,
            template:null,
            ppaths:null
        };
        this._createBookmarksHolder();
    }

    get history() { return this._data.history; }
    get template() { return this._data.template; }
    get ppaths() { return this._data.ppaths; }

    get current() { if(this._data.history.empty()) return null; return this._data.history.get(0); }
    set current(project_path) { return this._data.history.add(project_path); }

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

            loadFn:(fileData)=>{
                _self._data.ppaths = new ProjectsPath();
                _self._data.history = new ProjectsHistory();
                _self._data.template = new ProjectsTemplate();
                if(!_.isObject(fileData)){
                    return _self._data;
                }
                _self._data.history.fromJson(fileData.history);
                _self._data.template.fromJson(fileData.template);
                ProjectsManager.save();
                return _self._data;
            },

            saveFn:(pData)=>{
                return {
                    history:pData.history.toJson(),
                    template:pData.template.toJson()
                }
            }
        });
    }

}

module.exports = new ProjectsManager();
