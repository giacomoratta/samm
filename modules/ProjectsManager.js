let ProjectsHistory = require('../libs/ProjectsHistory.class');
let ProjectsTemplate = require('../libs/ProjectsTemplate.class');

class ProjectsManager {

    constructor(){
        this._data = {
            history:null,
            template:null
        };
        this._createBookmarksHolder();
    }

    get history() { return this._data.history; }
    get template() { return this._data.template; }

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
                _self._data.history = new ProjectsHistory();
                _self._data.template = new ProjectsTemplate(ConfigMgr.path('template_path'));
                if(!_.isObject(fileData)){
                    return _self._data;
                }
                _self._data.history.fromJson(fileData.history);
                _self._data.template.fromJson(fileData.template);
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
