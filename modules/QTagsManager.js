let QTags = require('../libs/QTags.class');

class QTagsManager {

    constructor(){
        this.qtagsObj = null;
        this._createBookmarksHolder();
    }


    printList(printFn){
        return this.qtagsObj.forEach(function(t,q){
            printFn('  '+t+' : '+q);
        });
    }


    add(tag,query){
        return this.qtagsObj.add(tag,query);
    }


    remove(tag){
        return this.qtagsObj.remove(tag);
    }


    save(){
        return DataMgr.save('projects');
    }


    _createBookmarksHolder(){
        let _self = this;
        return DataMgr.setHolder({
            label:'qtags',
            filePath:ConfigMgr.path('qtags'),
            fileType:'json',
            dataType:'object',
            logErrorsFn:d$,
            preLoad:true,

            loadFn:(fileData)=>{
                _self.qtagsObj = new QTags();
                if(!_.isObject(fileData)){
                    return _self.qtagsObj;
                }
                _self.qtagsObj.fromJson(fileData);
                return _self.qtagsObj;
            },

            saveFn:(qtagsObj)=>{
                return qtagsObj.toJson();
            }
        });
    }

}

module.exports = new QTagsManager();
