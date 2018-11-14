let BookmarksClass = require('../libs/Bookmarks.class');

class BookmarksManager {

    constructor(){

        this._createBookmarksHolder();

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

    show(){
        let bookmObj = DataMgr.print('bookmarks');
        bookmObj.print();
    }

    set(options){
        let bookmObj = DataMgr.print('bookmarks');
        bookmObj.add();
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
