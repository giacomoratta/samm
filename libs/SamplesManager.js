const Samples = require('./Samples.class.js');

class SamplesManager {

    constructor(){
    }

    checkSampleName(path_string){
        path_string = _.toLower(path_string);
        if(_.indexOf(ConfigMgr.get('ExtensionExcludedForSamples'),path.extname(' '+path_string))>=0){ //space needed to read 'only-ext' files
            return false;
        }
        return true;
    }


    scanSamples(){
        let smp_obj = new Samples();
        this._scanSamples(smp_obj, ConfigMgr.get('SamplesDirectory'), { maxRec:1000000 }); //1.000.000
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
        let samples_index = path.resolve('./'+ConfigMgr._filename.samples_index);
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
        let samples_index = path.resolve('./'+ConfigMgr._filename.samples_index);
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


    processTagString(ts){
        let _obj = {
            array:[],
            check_fn:null,
            check_fn_string:""
        };
        ts = _.toLower(ts).replace(/[^a-zA-Z0-9\s +,]/g,'');;

        /* Split tags and shuffle */
        let tagOR = _.split(ts,',');
        if(!_.isArray(tagOR) || tagOR.length<=0) return null;
        tagOR = _.shuffle(tagOR);

        /* Building new function */
        tagOR.forEach(function(v,i,a){
            let tagAND=_.split(v,'+');
            tagAND.forEach(function(v,i,a){
                a[i]=_.trim(a[i]);
                _obj.array.push(a[i]);
            });
            _obj.check_fn_string+="if( f.indexOf('"+ _.join(tagAND,"')>=0 && f.indexOf('") +"')>=0 ) return true;\n";
        });
        _obj.check_fn_string+="return false;\n";
        _obj.check_fn = Utils.newFunction('f',_obj.check_fn_string);
        if(!_obj.check_fn) return null;
        //d(_obj.check_fn_string);return null;

        delete _obj.check_fn_string;
        return _obj;
    }


    searchSamplesByTags(tagString){
        let smp_obj = new Samples();
        let ptags_obj = this.processTagString(tagString);
        if(!ptags_obj) return null;

        console.log(" Looking for: '"+_.join(ptags_obj.tags,"', '")+"'");

        let attempts = 3;
        let _MaxOccurrencesSameDirectory = ConfigMgr.get('MaxOccurrencesSameDirectory');

        while(attempts>0){
            smp_obj.init();
            smp_obj.tags = ptags_obj.array;

            for(let i=0; i<ConfigMgr._sampleScan.length; i++) {
                if(ptags_obj.check_fn(_.toLower(ConfigMgr._sampleScan[i]))){
                    //console.log("  ",ConfigMgr._sampleScan[i]);
                    smp_obj.array.push(ConfigMgr._sampleScan[i]);
                }
            }
            if(smp_obj.array.length<=0) return null;

            smp_obj.setRandom(ConfigMgr.get('RandomCount'), _MaxOccurrencesSameDirectory);
            if(smp_obj.random.length==ConfigMgr.get('RandomCount')) break;
            _MaxOccurrencesSameDirectory++;
            attempts--;
        }
        if(smp_obj.random.length<=0) return null;

        console.log(" Random selection of "+ConfigMgr.get('RandomCount')+" samples","(max "+_MaxOccurrencesSameDirectory+" from the same directory)");
        Utils.printArrayOrderedList(smp_obj.random,'   ');

        return smp_obj;
    }


    saveLookupToFile(smp_obj){
        if(!smp_obj) return false;
        let lookup_file = path.resolve('./'+ConfigMgr._filename.latest_lookup);
        let text_to_file = smp_obj.toText();
        return new Promise(function(res,rej){
            fs.writeFile(lookup_file, text_to_file, 'utf8',function(err){
                if(err){ rej(err); return; }
                res(lookup_file);
            });
        });
    }


    openLookupFile(){
        let lookup_file = path.resolve('./'+ConfigMgr._filename.latest_lookup);
        let file_to_text = "";
        try{
            file_to_text = fs.readFileSync(lookup_file, 'utf8');
        }catch(e){
            //console.log(e);
            return null;
        }
        let smp_obj = new Samples();
        if(!smp_obj.fromText(file_to_text)) return null;
        return smp_obj;
    }


    generateSamplesDir(smp_obj,smp_dirname){
        let _path = path;
        //if(smp_obj.array.length>0 && smp_obj.array[0].indexOf('\\')>0) _path=path.win32;

        if(!_.isString(smp_dirname) || smp_dirname.length<2) smp_dirname=_.join(smp_obj.tags,'_');//.substring(0,20);

        let p_array = [];
        let smpl_dir = path.join(ConfigMgr.get('ProjectsDirectory'), ConfigMgr.get('Project'),ConfigMgr._labels.sample_dir, smp_dirname);
        let _removed_dir = path.join(smpl_dir,'_not_used');
        let _links_dir = path.join(smpl_dir,'_links');

        fs_extra.ensureDirSync(smpl_dir);
        fs_extra.ensureDirSync(_removed_dir);
        fs_extra.ensureDirSync(_links_dir);

        let smpl_arr = smp_obj.random;
        if(!smpl_arr || smpl_arr.length<=0) smpl_arr = smp_obj.array;
        if(!smpl_arr || smpl_arr.length<=0) return null;
        smpl_arr.forEach(function(v,i,a){
            let f_name = path.basename(v);
            let link_file_name = f_name+'___'+Utils.replaceAll(v.substring(ConfigMgr.get('SamplesDirectory').length),_path.sep,'--');
            p_array.push(fs_extra.copy(v,path.join(smpl_dir ,f_name)));
            p_array.push(new Promise(function(res,rej){
                fs.writeFile(path.join(_links_dir ,link_file_name), v, 'utf8',function(err){
                    d(link_file_name);
                    if(err) return rej(err);
                    return res(link_file_name);
                })
            }));
        });

        return Promise.all(p_array)
            .then(function(data){
                //console.log('success!');
            })
            .catch(function(err){
                console.error(err);
            });
    }
};

module.exports = new SamplesManager();
