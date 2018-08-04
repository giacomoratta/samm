const CliParams = require('./CliParams.class.js');

class CliManager {

    constructor(){
        this._error_code = -1;
        this._success_code = 1;
        this.cli_params = null;
    }

    processParams(cli_values){
        this.cli_params = new CliParams(cli_values);
        return this.cli_params;
    }


    C_set(){
        if(!this.cli_params.hasValues()){
            console.log("Set command: missing property name");
            return this._error_code;
        }
        if(!ConfigMgr.checkProperty(this.cli_params.get(0))){
            console.log("Set command: unknown property name '"+this.cli_params.get(0)+"'");
            return this._error_code;
        }
        let _new_prop_val=this.cli_params.get(1);
        if(!_new_prop_val){
            console.log("Set command: missing value for property");
            return this._error_code;
        }
        if(ConfigMgr.setFromCliParams(this.cli_params.get(0),this.cli_params.getValues(1))===null){
            console.log("Set command: configuration not changed");
            return this._error_code;
        }
        if(ConfigMgr.save()!==true){
            console.log("Set command: error during file writing");
            return this._error_code;
        }
        console.log("Set command: configuration saved successfully");
        ConfigMgr.print();
        return this._success_code;
    }


    C_scan(){
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


    C_lookup(){
        if(!this.cli_params.hasValues()){
            console.log("Lookup command: missing tags or option (-t)");
            return this._error_code;
        }

        let tagString=null;
        if(this.cli_params.hasOption(ConfigMgr._cli_options.tag_label)){
            if(!this.cli_params.hasValues()){
                console.log("Lookup command: missing tag name after option -t");
                return this._error_code;
            }
            let _tagString = ConfigMgr.get('Tags')[this.cli_params.get(0)];
            if(_.isNil(_tagString)){
                console.log("Lookup command: unknown tag name after option -t");
                return this._error_code;
            }
            tagString = _tagString;
        } else {
            tagString = this.cli_params.get(0);
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
        if(!smp_obj){
            console.log("Lookup command: sample search failed");
            return this._error_code;
        }
        else if(smp_obj.isEmpty()){
            console.log("Lookup command: no samples found");
            return this._error_code;
        }

        if(SamplesMgr.equalToOldLookup(smp_obj)){
            console.log("Lookup command: result not changed from last lookup.\n");
            return this._success_code;
        }

        let _promise = SamplesMgr.saveLookupToFile(smp_obj);
        if(!_promise){
            console.log("Lookup command: invalid tags");
            return this._error_code;
        }

        return _promise.then(function(lf){
            //console.log("Lookup command: lookup file successfully created");
            return lf;
        }).catch(function(e){
            console.log("Lookup command: lookup file writing failed");
        });
    }


    C_save(){
        let smp_dirname = null;

        if(!ConfigMgr.get('ProjectsDirectory')){
            console.log("Save command: configuration parameter missing (ProjectsDirectory)");
            return this._error_code;
        }
        if(!ConfigMgr.get('Project')){
            console.log("Save command: configuration parameter missing (Project)");
            return this._error_code;
        }

        if(this.cli_params.hasOption(ConfigMgr._cli_options.directory_name)){
            if(!this.cli_params.hasValues()){
                console.log("Save command: directory name missing");
                return this._error_code;
            }
            smp_dirname = this.cli_params.get(0);
        }

        let smp_obj = SamplesMgr.openLookupFile();
        if(!_.isObject(smp_obj)){
            console.log("Save command: latest lookup missing");
            return this._error_code;
        }

        return SamplesMgr.generateSamplesDir(smp_obj,{
            dirname:smp_dirname
        });
    }

};

module.exports = new CliManager();
