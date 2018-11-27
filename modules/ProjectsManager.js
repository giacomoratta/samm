let ProjectsHistory = require('../libs/ProjectsHistory.class');

class ProjectsManager {

    constructor(){
        this._data = {
            history:null
        };
        this._createBookmarksHolder();
    }

    get history() { return this._data.history; }

    get current() { return this._data.history.get(0); }
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
                if(!_.isObject(fileData)){
                    return _self._data;
                }
                _self._data.history.fromJson(fileData.history);
                return _self._data;
            },

            saveFn:(pData)=>{
                return {
                    history:pData.history.toJson()
                }
            }
        });
    }

}

module.exports = new ProjectsManager();
