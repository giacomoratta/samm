
class FS_Samples {

    constructor(){
    }

    checkSampleName(path_string, names){
        path_string = _.toLower(path_string);
        if(_.indexOf(Config.getExtensionExcludedForSamples(),path.extname(path_string))>=0) return false;

        for (let i=0; i<names.length; i++){
            if(_.includes(path_string,names[i])) return true; //case sensitive!
        }
        return false;
    }


    searchSamplesByTags(tags){
        tags.forEach(function(v, i, a){ a[i] = _.trim(_.toLower(a[i])); }); //normalize tags
        console.log(" Looking for: '"+_.join(tags,"', '")+"'");

        let finalArray = [];
        this._searchSamplesByTags(tags, Config.getSamplesDirectory(), finalArray);

        if(finalArray.length<=0) return null;
        this._selectRandomSamples(finalArray,20);

        return {
            array:finalArray,
            tags:tags
        }
    }


    _searchSamplesByTags(names, dir_path, f_array, _maxRec){
        let items = fs.readdirSync(dir_path).sort();
        for (let i=0; i<items.length; i++) {
            //console.log(' >> ',items[i]);

            let path_string = path.join(dir_path,items[i]);
            let fsStat = fs.lstatSync(path_string);

            if(fsStat.isDirectory()){
                this._searchSamplesByTags(names, path_string, f_array);

            }else if(fsStat.isFile() && this.checkSampleName(path_string,names)){
                // checkSampleName on path_string because we want to accept samples belonging directory with good name
                console.log("  ",path_string);
                f_array.push(path_string);
            }
        }
    }


    _selectRandomSamples(f_array, count){
        console.log("\n\n  Random Samples");
        let r_array = [];
        let size = f_array.length;
        for(let i=0, rf, rn; i<count; i++){
            rn=_.random(0,size);
            rn=((rn*7)%size);
            rf=f_array[rn];
            r_array.push(rf);
            console.log("   - ",rf);
        }
        return f_array.sort();
    }


    generateSamplesDir(smp_obj, dir){
        let path_name = path.join('L:\\',_.join(smp_obj.tags,"_"));
        fs.mkdir(path,function(e){
            if(!e){
                //new directory created
            } else if(e && e.code === 'EEXIST'){
                //do something with contents
            } else {
                //debug
                console.log(e);
            }
        });
    }
};

module.exports = new FS_Samples();
