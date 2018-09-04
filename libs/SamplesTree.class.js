class SamplesTree {

    constructor(absPath, ST_options, DT_options){
        this.T = new DirectoryTree(absPath,DT_options);

        this._lastFilterByTags = null;
        this._lastFilterRandom = null;
    }

    empty(){
        return this.T.empty();
    }

    size(){
        return this.T.fileCount();
    }

    getOriginPath(){
        return this.T.rootPath();
    }


    /**
     * Perform a search by tags.
     * The tag string is formatted with ',' (OR) and '+' (AND).
     * @param tagString
     * @returns { array | null }
     */
    filterByTags(tagString){
        if(!this.T) return;

        let smp_obj = new Samples(this.T.rootPath(),tagString);
        if(smp_obj.error()) return null;

        this.T.walk({
            itemCb:(itemData)=>{
                smp_obj.add(itemData.item /* {PathInfo} */);
            }
        });
        if(smp_obj.empty()) return;
        return smp_obj;
    }


    filterRandom(){

    }


    searchSamplesByTags33(smp_obj_scan, tagString){
        if(!this.T) return;

        let ptags_obj = this.processTagString(tagString);
        if(!ptags_obj) return null;

        let attempts = 5;
        let _MaxOccurrencesSameDirectory = ConfigMgr.get('MaxOccurrencesSameDirectory');
        let _RandomCount = ConfigMgr.get('RandomCount');
        let search_array;

        while(attempts>0){
            search_array = [];
            this.T.walk({
                itemCb:(itemData)=>{
                    search_array.push(itemData.item);
                }
            });
            if(search_array.length<1) return;

            smp_obj_random = smp_obj.getRandom(_RandomCount, _MaxOccurrencesSameDirectory);
            if(smp_obj_random && smp_obj_random.size()>=_RandomCount) break;
            _MaxOccurrencesSameDirectory++;
            attempts--;

            smp_obj.init();
            smp_obj_scan.forEach(function(item,index){
                if(ptags_obj.check_fn(item.n_path)){
                    smp_obj.addItem(item);
                }
            });
            if(smp_obj.empty()) return smp_obj;


        }
        if(!smp_obj_random || smp_obj_random.empty()) return smp_obj_random;






        let smp_obj = new Samples();
        let smp_obj_random = null;

        while(attempts>0){
            smp_obj.init();
            smp_obj_scan.forEach(function(item,index){
                if(ptags_obj.check_fn(item.n_path)){
                    smp_obj.addItem(item);
                }
            });
            if(smp_obj.empty()) return smp_obj;

            smp_obj_random = smp_obj.getRandom(_RandomCount, _MaxOccurrencesSameDirectory);
            if(smp_obj_random && smp_obj_random.size()>=_RandomCount) break;
            _MaxOccurrencesSameDirectory++;
            attempts--;
        }
        if(!smp_obj_random || smp_obj_random.empty()) return smp_obj_random;
        //smp_obj_random.setTags(ptags_obj.array);

        //smp_obj_random.print('   ',function(n){ return n.substring(ConfigMgr.get('SamplesDirectory').length); });
        //console.log("\n   Performed search: '"+ptags_obj.string+"'");
        //console.log(  "   Random selection of "+_RandomCount+" samples","(max "+_MaxOccurrencesSameDirectory+" from the same directory)");
        //d(smp_obj_random);
        return smp_obj_random;
    }

    searchSamplesByTags22(smp_obj_scan, tagString){
        let smp_obj = new Samples();
        let ptags_obj = this.processTagString(tagString);
        if(!ptags_obj) return null;

        let attempts = 5;
        let _MaxOccurrencesSameDirectory = ConfigMgr.get('MaxOccurrencesSameDirectory');
        let _RandomCount = ConfigMgr.get('RandomCount');
        let smp_obj_random = null;

        while(attempts>0){
            smp_obj.init();
            smp_obj_scan.forEach(function(item,index){
                if(ptags_obj.check_fn(item.n_path)){
                    smp_obj.addItem(item);
                }
            });
            if(smp_obj.empty()) return smp_obj;

            smp_obj_random = smp_obj.getRandom(_RandomCount, _MaxOccurrencesSameDirectory);
            if(smp_obj_random && smp_obj_random.size()>=_RandomCount) break;
            _MaxOccurrencesSameDirectory++;
            attempts--;
        }
        if(!smp_obj_random || smp_obj_random.empty()) return smp_obj_random;
        //smp_obj_random.setTags(ptags_obj.array);

        //smp_obj_random.print('   ',function(n){ return n.substring(ConfigMgr.get('SamplesDirectory').length); });
        //console.log("\n   Performed search: '"+ptags_obj.string+"'");
        //console.log(  "   Random selection of "+_RandomCount+" samples","(max "+_MaxOccurrencesSameDirectory+" from the same directory)");
        //d(smp_obj_random);
        return smp_obj_random;
    }
}

module.exports = SamplesTree;
