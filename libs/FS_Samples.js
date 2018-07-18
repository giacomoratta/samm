
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
                    });;
                }
            })
            .catch(function(err){
                    console.error(err);
            });
    }
};

module.exports = new FS_Samples();
