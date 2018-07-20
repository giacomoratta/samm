const Samples = require('./Samples.class.js');

class SamplesManager {

    constructor(){
    }

    checkSampleName(path_string, tags){
        path_string = _.toLower(path_string);
        if(_.indexOf(ConfigMgr.getExtensionExcludedForSamples(),path.extname(path_string))>=0){
            return false;
        }
        if(!_.isArray(tags)) return true;
        for (let i=0; i<tags.length; i++){
            let flagAND=true;
            let flagOR=false;
            for(let j=0; j<tags[i].length; j++){
                if(_.includes(path_string,tags[i])) flagOR=true; //case sensitive!
                else flagAND=false;
            }
            if(flagOR && tags[i].length==1) return true;
            if(flagAND && tags[i].length>1) return true;
        }
        return false;
    }


    scanSamples(){
        let smp_obj = new Samples();
        this._scanSamples(smp_obj, ConfigMgr.getSamplesDirectory(), { maxRec:1000000 }); //1.000.000
        if(smp_obj.array.length<=0) return null;
        return smp_obj;
    }


    _scanSamples(smp_obj, dir_path, _options){
        if(_options.maxRec<=0){
            console.log('scanSamples: max recursions reached');
            return;
        }
        _options.maxRec

        let items = fs.readdirSync(dir_path);
        items = Utils.sortFilesArray(items);

        for (let i=0; i<items.length; i++) {
            //console.log(' >> ',items[i]);

            let path_string = path.join(dir_path,items[i]);
            let fsStat = fs.lstatSync(path_string);

            if(fsStat.isDirectory()){
                this._scanSamples(smp_obj, path_string, _options);

            }else if(fsStat.isFile() && this.checkSampleName(path_string)){
                // checkSampleName on path_string because we want to accept samples belonging directory with good name
                console.log("  ",path_string);
                smp_obj.array.push(path_string);
            }
        }
    }


    loadSampleScanFromFile(){
        let samples_index = path.resolve('./'+ConfigMgr.filename.samples_index);
        let json_string = '';
        try{
            json_string = fs.readFileSync(samples_index,'utf8');
        }catch(e){
            //console.log(e);
            return null;
        }
        let smp_obj = new Samples();
        if(!smp_obj.fromJsonString(json_string)) return null;
        return smp_obj;
    }


    saveSampleScanToFile(smp_obj){
        if(!smp_obj) return false;
        let samples_index = path.resolve('./'+ConfigMgr.filename.samples_index);
        let json_string = smp_obj.toJsonString();
        if(!json_string) return null;
        try{
            fs.writeFileSync(samples_index, json_string, 'utf8');
        }catch(e){
            //console.log(e);
            return false;
        }
        return true;
    }


    searchSamplesByTags(tags){
        let smp_obj = new Samples();
        let splitted_tags=[];
        smp_obj.tags = tags;
        smp_obj.tags.forEach(function(v, i, a){
            a[i] = _.trim(_.toLower(a[i]));
            if(a[i].indexOf('+')>=0) splitted_tags.push(_.split(a[i],'+'));
            else splitted_tags.push([a[i]]);
        }); //normalize tags
        console.log(" Looking for: '"+_.join(smp_obj.tags,"', '")+"'");

        for(let i=0; i<ConfigMgr._sampleScan.length; i++) {
            //console.log(' >> ',items[i]);
            let path_string = ConfigMgr._sampleScan[i];

            if(this.checkSampleName(path_string,splitted_tags)){
                // checkSampleName on path_string because we want to accept samples belonging directory with good name
                //console.log("  ",path_string);
                smp_obj.array.push(path_string);
            }
        }
        if(smp_obj.array.length<=0) return null;
        console.log(" Random selection of "+ConfigMgr.get('RandomCount')+" samples","(max "+ConfigMgr.get('MaxOccurrencesSameDirectory')+" from the same directory)");
        smp_obj.setRandom(ConfigMgr.get('RandomCount'), ConfigMgr.get('MaxOccurrencesSameDirectory'));
        return smp_obj;
    }


    _searchSamplesByTags(smp_obj, dir_path){
        let items = fs.readdirSync(dir_path).sort();
        for (let i=0; i<items.length; i++) {
            //console.log(' >> ',items[i]);

            let path_string = path.join(dir_path,items[i]);
            let fsStat = fs.lstatSync(path_string);

            if(fsStat.isDirectory()){
                this._searchSamplesByTags(smp_obj, path_string, smp_obj.array);

            }else if(fsStat.isFile() && this.checkSampleName(path_string,smp_obj.tags)){
                // checkSampleName on path_string because we want to accept samples belonging directory with good name
                console.log("  ",path_string);
                smp_obj.array.push(path_string);
            }
        }
    }


    saveSampleObjectToFile(smp_obj){
        if(!smp_obj) return false;
        let lookup_file = path.resolve('./'+ConfigMgr.filename.latest_lookup);
        let text_to_file = smp_obj.toText();
        let x = fs.writeFile(lookup_file, text_to_file, 'utf8',function(err){
            if(err){ console.error(err); return; }
            console.log("The file was saved!",lookup_file);
        });
    }


    openSampleObjectToFile(){
        let lookup_file = path.resolve('./'+ConfigMgr.filename.latest_lookup);
        let file_to_text = "";
        try{
            file_to_text = fs.readFileSync(lookup_file);
        }catch(e){
            console.log(e);
            return null;
        }
        let smp_obj = new Samples();
        if(!smp_obj.fromText(file_to_text)) return null;
        return smp_obj;
    }


    generateSamplesDir(smp_obj, smp_dirname){
        let p_array = [];
        let dest_dir = path.join(ConfigMgr.ProjectsDirectory, 'smpl_'+_.join(smp_obj.tags,'_').substring(0,20));
        let readme_file = path.join(dest_dir,'summary.txt');

        fs_extra.ensureDirSync(dest_dir);
        fs_extra.ensureDirSync(path.join(dest_dir,'_removed'));

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

module.exports = new SamplesManager();
