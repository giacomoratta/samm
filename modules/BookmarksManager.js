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

        if(options.all===true){
            bookmObj.forEach((v,lb,i,diffLb)=>{
                this._latestArray.push(v);
            });

        }else if(options.lookup===true){
            bookmObj.forEach((v,lb,i,diffLb)=>{
                this._latestArray.push(v);
            });

        }else if(_.isString(options.tag) && options.tag.length>0){
            bookmObj.forEach(options.tag,(v,lb,i,diffLb)=>{
                this._latestArray.push(v);
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
