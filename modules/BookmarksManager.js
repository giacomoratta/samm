class BookmarksManager {

    constructor(){

        this._bookmHolder = this._createBookmarksHolder();

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

    show(options){
        if(!SamplesMgr.hasLatestLookup()){
            _clUI.print("no recent lookup found; perform a lookup before this command");
            return this._error_code;
        }
    }

    set(options){
    }

    _createBookmarksHolder(options){
        return DataMgr.setHolder({
            label:'bookmarks',
            filePath:ConfigMgr.path('bookmarks'),
            fileType:'json',
            dataType:'object',
            logErrorsFn:console.log,
            preLoad:true
        });
    }

}

module.exports = new BookmarksManager();
