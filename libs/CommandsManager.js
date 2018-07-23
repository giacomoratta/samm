
class CommandsManager {

    constructor(){
        this._error_code = -1;
        this._success_code = 1;
    }


    C_set(cli_params){
        if(_.isNil(cli_params[1])){
            console.log("Set command: missing property name");
            return this._error_code;
        }
        if(!ConfigMgr.checkProperty(cli_params[1])){
            console.log("Set command: unknown property name '"+cli_params[1]+"'");
            return this._error_code;
        }
        let _new_prop_val=cli_params[2];
        if(_.isNil(_new_prop_val)){
            console.log("Set command: missing value for property");
            return this._error_code;
        }
        if(ConfigMgr.set(cli_params[1],_.slice(cli_params,2))===null){
            console.log("Set command: configuration not changed");
            return this._error_code;
        }
        if(ConfigMgr.save()!==true){
            console.log("Set command: error during file writing");
            return this._error_code;
        }
        console.log("Set command: configuration saved successfully");
        return this._success_code;
    }


    C_scan(cli_params){
        let smp_obj = SamplesMgr.scanSamples();
        if(!smp_obj){
            console.log("Scan command: scansion failed");
            return this._error_code;
        }
        console.log("Scan command: scansion completed ("+smp_obj.array.length+" samples found)");
        if(!SamplesMgr.saveSampleScanToFile(smp_obj)){
            console.log("Scan command: file writing failed");
            return this._error_code;
        }
        return smp_obj;
    }


    C_lookup(cli_params){
        if(cli_params.length<2){
            console.log("Lookup command: missing tags or option (-t)");
            return this._error_code;
        }

        let tagString=null;
        if(cli_params[1]=='-t'){
            if(cli_params.length<3){
                console.log("Lookup command: missing tag name after option -t");
                return this._error_code;
            }
            let _tagString = ConfigMgr.get('Tags')[cli_params[2]];
            if(_.isNil(_tagString)){
                console.log("Lookup command: unknown tag name after option -t");
                return this._error_code;
            }
            tagString = _tagString;
        } else {
            tagString = cli_params[1];
        }
        if(!_.isString(tagString) || tagString.length<1){
            console.log("Lookup command: empty tag list");
            return this._error_code;
        }


        let smp_obj_scan = SamplesMgr.loadSampleScanFromFile();
        if(!smp_obj_scan){
            console.log("Lookup command: no sample scan found");
            return this._error_code;
        }
        ConfigMgr._sampleScan = smp_obj_scan.array;

        let smp_obj = SamplesMgr.searchSamplesByTags(tagString);
        SamplesMgr.saveLookupToFile(smp_obj);
        return smp_obj;
    }


    C_save(cli_params){
        let smp_dirname = null;

        if(!ConfigMgr.get('ProjectsDirectory')){
            console.log("Save command: configuration parameter missing (ProjectsDirectory)");
            return this._error_code;
        }
        if(!ConfigMgr.get('Project')){
            console.log("Save command: configuration parameter missing (Project)");
            return this._error_code;
        }

        if(cli_params[1]=='-d'){
            if(_.isNil(cli_params[2])){
                console.log("Save command: directory name missing");
                return this._error_code;
            }
            smp_dirname = cli_params[2];
        }

        let smp_obj = SamplesMgr.openLookupFile();
        if(!_.isObject(smp_obj)){
            console.log("Save command: latest lookup missing");
            return this._error_code;
        }

        return SamplesMgr.generateSamplesDir(smp_obj,smp_dirname);
    }

};

module.exports = new CommandsManager();
