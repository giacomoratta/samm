let Bookmarks = require('../libs/Bookmarks.class');

class BookmarksManager {

    constructor(){

        this._createBookmarksHolder();
        this._latestArray = [];
        this._workingSet = null;
        this._workingSet_type = null;

        this._enums = {
            wkset_type: {
                all:0,
                tag:1,
                lookup:2
            }
        }
    }


    printWorkingSet(options,printPrefixFn,printFn){
        if(options.lookup){
            printPrefixFn('working with samples founded with latest lookup:');
            if(!this._workingSet || this._workingSet.empty())  { printPrefixFn("no samples in the latest lookup."); return false; }
        }else if(options.tag){
            printPrefixFn('working with bookmarked samples under',options.tag);
            if(!this._workingSet || this._workingSet.empty()) { printPrefixFn("no bookmarked samples under'"+options.tag+"'."); return false; }
        }else{
            printPrefixFn('working with all bookmarked samples');
            if(!this._workingSet || this._workingSet.empty()) { printPrefixFn("no bookmarked samples."); return false; }
        }
        this._workingSet.printIndexedList(printFn);
        //d$(this._workingSet);
        return true;
    }


    workingSet(options){
        this._workingSet = null;
        this._workingSet_type = null;

        options = _.merge({
            all:false,
            lookup:false,
            tag:null
        },options);
        this._latestArray = [];
        let bookmObj = DataMgr.get('bookmarks');

        // LATEST LOOKUP
        if(options.lookup===true){
            let smp_obj = SamplesMgr.getLatestLookup();
            if(!_.isObject(smp_obj) || smp_obj.empty()){
                return null;
            }
            this._workingSet = new Bookmarks();
            smp_obj.forEach((v)=>{
                this._workingSet.add(v);
            });
            this._workingSet_type = this._enums.wkset_type.lookup;
            return this._workingSet;

        // TAGGED BOOKMARKS
        }else if(_.isString(options.tag) && options.tag.length>0){
            if(bookmObj.empty() || bookmObj.empty(options.tag)){
                return null;
            }
            this._workingSet = bookmObj.cloneSubStructure(options.tag);
            this._workingSet_type = this._enums.wkset_type.tag;
            return this._workingSet;

        // ALL BOOKMARKS
        }else{
            if(bookmObj.empty()){
                return null;
            }
            this._workingSet = bookmObj.cloneStructure();
            this._workingSet_type = this._enums.wkset_type.all;
            return this._workingSet;
        }
    }


    set(addIds, removeIds, label, showingTag){
        let elmt;
        let bookmObj = DataMgr.get('bookmarks');
        let addElmts = [];
        let removeElmts = [];

        addIds.forEach((elmtIndex)=>{
            elmt = this._workingSet.getByIndex(elmtIndex-1);
            if(!elmt) return;
            addElmts.push(elmt);
        });
        removeIds.forEach((elmtIndex)=>{
            elmt = this._workingSet.getByIndex(elmtIndex-1);
            if(!elmt) return;
            removeElmts.push(elmt);
        });

        addElmts.forEach((elmt)=>{
            if(this._workingSet_type === this._enums.wkset_type.all){
                this._workingSet.add(elmt.smpobj,label);
            }
            bookmObj.add(elmt.smpobj,label);
        });
        removeElmts.forEach((elmt)=>{
            if(this._workingSet_type === this._enums.wkset_type.all){
                this._workingSet.remove(elmt.smpobj,elmt.label);
                bookmObj.remove(elmt.smpobj,elmt.label);

            }else if(this._workingSet_type === this._enums.wkset_type.lookup){
                bookmObj.remove(elmt.smpobj,elmt.label);

            }else if(_.isString(showingTag) && this._workingSet_type === this._enums.wkset_type.tag){
                this._workingSet.remove(elmt.smpobj);
                bookmObj.remove(elmt.smpobj,showingTag);
            }
        });
    }


    save(){
        DataMgr.save('bookmarks');
    }


    _createBookmarksHolder(){
        return DataMgr.setHolder({
            label:'bookmarks',
            filePath:ConfigMgr.path('bookmarks'),
            fileType:'json',
            dataType:'object',
            logErrorsFn:console.log,
            preLoad:true,

            // setFn:()=>{
            //     return __new_bookmObj();
            // },

            initFn:()=>{
                return new Bookmarks();
            },

            loadFn:(fileData)=>{
                d$('loading');
                let bookmObj = new Bookmarks();
                if(!_.isObject(fileData)){
                    return bookmObj;
                }
                bookmObj.fromJson(fileData);
                return bookmObj;
            },

            saveFn:(bookmObj)=>{
                return bookmObj.toJson();
            }
        });
    }

}

module.exports = new BookmarksManager();
