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

    static printLI(pre,i,v){
        clUI.print(pre, (i+1)+")", v);
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


    set(addIds, removeIds, label){
        let elmt;
        let bookmObj = DataMgr.get('bookmarks');
        addIds.forEach((elmtIndex)=>{
            elmt = this._workingSet.getByIndex(elmtIndex-1);
            if(!elmt) return;
            if(this._workingSet_type !== this._enums.wkset_type.lookup){
                this._workingSet.add(elmt.smpobj,label);
            }
            bookmObj.add(elmt.smpobj,label);
        });
        removeIds.forEach((elmtIndex)=>{
            elmt = this._workingSet.getByIndex(elmtIndex-1);
            if(!elmt) return;
            if(this._workingSet_type !== this._enums.wkset_type.lookup){
                this._workingSet.remove(elmt.index,label);
            }
            bookmObj.remove(elmt.index,label);
        });

        bookmObj.printIndexedList(console.log);
    }

    save(){

    }


    show1(options){
        options = _.merge({
            all:false,
            lookup:false,
            tag:null
        },options);
        this._latestArray = [];
        let _clUI = clUI.newLocalUI('> bookm show:');
        let bookmObj = DataMgr.get('bookmarks');

        // LATEST LOOKUP
        if(options.lookup===true){
            let smp_obj = SamplesMgr.getLatestLookup();
            if(!_.isObject(smp_obj) || smp_obj.empty()){
                _clUI.print("latest lookup missing or empty.");
                return null;
            }
            _clUI.print("samples in the latest lookup");
            smp_obj.forEach((v,i)=>{
                this._latestArray.push(v.path);
                BookmarksManager.printLI(' ',i,v.path);
            });

        // TAGGED BOOKMARKS
        }else if(_.isString(options.tag) && options.tag.length>0){
            if(bookmObj.empty() || bookmObj.empty(options.tag)){
                _clUI.print("no bookmarked samples under the label '"+options.tag+"'.");
                return null;
            }
            _clUI.print("all bookmarked samples under the label '"+options.tag+"'");
            bookmObj.forEach(options.tag,(v,i)=>{
                BookmarksManager.printLI(' ',i,v);
            });

        // ALL BOOKMARKS
        }else{
            d$(bookmObj);
            if(bookmObj.empty()){
                _clUI.print("no bookmarked samples.");
                return null;
            }
            _clUI.print("all bookmarked samples");
            bookmObj.forEach((v,i,lb,diffLb)=>{
                this._latestArray.push(v);
                if(diffLb===true) clUI.print(' >', "label:", lb);
                BookmarksManager.printLI('    ',i,v);
            });
        }
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
