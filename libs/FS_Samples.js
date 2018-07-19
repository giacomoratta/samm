
class FS_Samples {

    constructor(){
    }

    checkSampleName(path_string, names){
        path_string = _.toLower(path_string);
        if(_.indexOf(Config.getExtensionExcludedForSamples(),path.extname(path_string))>=0){
            return false;
        }
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
        let randomArray = this._selectRandomSamples(finalArray,20);

        return {
            array:finalArray,
            random:randomArray,
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
        let _sameDirectoryMaxOccurs = function(arr,f,o_obj,max_o){
            let f_path = path.dirname(f);
            for(let i=0; i<arr.length; i++){
                let arrf_path = path.dirname(arr[i]);
                if(f_path == arrf_path){
                    if(!_.isObject(o_obj) || !_.isInteger(max_o)) return true;
                    if(_.isNil(o_obj[f_path])) o_obj[f_path]=0;
                    if(o_obj[f_path]>=max_o) return true;
                    o_obj[f_path]++;
                    return false;
                }
            }
            return false;
        };

        let r_array = [];
        let size = f_array.length;
        let i=0, sec=size, rf, rn;
        let occur_obj = {};
        let max_occur = 2;
        while(i<count && sec>0){
            sec--;
            rn=_.random(0,size);
            rn=((rn*7)%size);
            rf=f_array[rn];
            if(_sameDirectoryMaxOccurs(r_array,rf,occur_obj,max_occur)) continue;
            r_array.push(rf);
            console.log("   - ",rf);
            i++;
        }
        return Utils.sortFilesArray(r_array);
    }


    saveSampleObjectToFile(smp_obj){
        if(!_.isObject(smp_obj)) return false;
        let lookup_file = path.resolve('./'+Config.filename.latest_lookup);
        let text_to_file = _.join(smp_obj.random,"\n");
        text_to_file = smp_obj.tags+"\n\n"+text_to_file;
        return fs.writeFile(lookup_file, text_to_file, 'utf8',function(err){
            if(err){ console.error(err); return; }
            console.log("The file was saved!",lookup_file);
        });
    }


    openSampleObjectToFile(){
        let lookup_file = path.resolve('./'+Config.filename.latest_lookup);
        let file_to_text;
        try{
            file_to_text = fs.readFileSync(lookup_file);
        }catch(e){
            console.log(e);
            return null;
        }
        let file_rows = _.split(_.trim(file_to_text),"\n");
        if(!_.isArray(file_rows) || file_rows.length<5) return null;

        let smp_obj = { array:[], tags:'' };
        smp_obj.tags = file_rows[0];
        for(let i=2; i<file_rows.length; i++){
            smp_obj.array.push(file_rows[i]);
        }
        return smp_obj;
    }


    generateSamplesDir(smp_obj){
        let p_array = [];
        let dest_dir = path.join(Config.ProjectsDirectory, 'smpl', _.join(smp_obj.tags,'_').substring(0,20));
        let readme_file = path.join(dest_dir,'summary.txt');

        fs_extra.ensureDirSync(dest_dir);

        arr.forEach(function(v,i,a){
            let f_name = path.basename(v);
            p_array.push(fs_extra.copy(v,path.join(dest_dir ,f_name)));
        });

        return Promise.all(p_array)
            .then(function(data){
                console.log('success!');
                if(readme){
                    let text_to_file  = "\n"+_.join(arr,"\n");
                    return fs.writeFile(readme_file, text_to_file, 'utf8').then(function(data){
                        console.log("The file was saved!");
                    }).catch(function(err){
                        console.error(err);
                    });
                }
            })
            .catch(function(err){
                    console.error(err);
            });
    }
};

module.exports = new FS_Samples();
