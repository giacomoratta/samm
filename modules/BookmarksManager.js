let BookmarksClass = require('../libs/Bookmarks.class');

class BookmarksManager {

    constructor(){

        this._createBookmarksHolder();
        this._latestArray = [];

        /* CACHES */
        this._CACHE_latest_usage = {
            enums: { lookup:1, collection:2, subcollection:3 },
            data:{
                default:[]
            }
        };

        // DataHolder

        // [1] bookm -l     // set array with lookup
        // [2] bookm -a     // set array with bookmarks
        // [3] bookm -t x    // set array with bookmarks label
                            // array sort A-Z

        // bookm 1 2 3 4
        // bookm -r 1 2 3 4
        // bookm -t x 1 2 3 4 5
    }

    static printLI(pre,i,v){
        clUI.print(pre, (i+1)+")", v);
    }

    showAndSet(options){

        //bookmObj.add();
    }

    show(options){
        options = _.merge({
            all:false,
            lookup:false,
            tag:null
        },options);
        let bookmObj = DataMgr.get('bookmarks');
        this._latestArray = [];
        let _clUI = clUI.newLocalUI('> bookm show:');

        // LATEST LOOKUP
        if(options.lookup===true){
            let smp_obj = SamplesMgr.getLatestLookup();
            if(!_.isObject(smp_obj) || smp_obj.empty()){
                _clUI.print("latest lookup missing or empty.");
                return null;
            }
            _clUI.print("samples in the latest lookup");
            smp_obj.forEach((v,i)=>{
                this._latestArray.push(v);
                BookmarksManager.printLI(' ',i,v);
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

    set(options){
        //let bookmObj = DataMgr.print('bookmarks');
        //bookmObj.add();
        while(true){
            // ask for ids and label
            // add/remove
            // no input = exit
            break;
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

            loadFn:(fileData)=>{
                let bookmObj = new BookmarksClass();
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
