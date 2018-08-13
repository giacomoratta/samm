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
        if(!this.cli_params.hasOption(ConfigMgr._cli_options.force)){
            if(SamplesMgr.sampleScanFileExists()){
                console.log("Scan command: the index file already exists. Use -f to force a rescan.");
                return this._error_code;
            }
        }

        let smp_obj = SamplesMgr.scanSamples();
        if(!smp_obj){
            console.log("Scan command: job failed");
            return this._error_code;
        }
        console.log("Scan command: job completed ("+smp_obj.size()+" samples found)");
        if(!SamplesMgr.saveSampleScanToFile(smp_obj)){
            console.log("Scan command: cannot write the index file");
            return this._error_code;
        }
        return smp_obj;
    }


    C_lookup(){
        let tagString=null;

        if(this.cli_params.hasOption(ConfigMgr._cli_options.tag_label)){
            tagString= this.cli_params.getOptionValue(ConfigMgr._cli_options.tag_label);
            if(!tagString){
                console.log("Lookup command: empty tag name after option "+ConfigMgr._cli_options.tag_label);
                return this._error_code;
            }
            tagString = ConfigMgr.get('Tags')[tagString];
            if(_.isNil(tagString)){
                console.log("Lookup command: unknown tag name after option "+ConfigMgr._cli_options.tag_label);
                return this._error_code;
            }

        }else{
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

        let smp_obj = SamplesMgr.searchSamplesByTags(smp_obj_scan, tagString);
        if(!smp_obj){
            console.log("Lookup command: sample search failed");
            return this._error_code;
        }
        else if(smp_obj.isEmpty()){
            console.log("Lookup command: no samples found");
            return this._error_code;
        }

        if(SamplesMgr.isEqualToPreviousLookup(smp_obj)){
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
        let C_save_options = {
            dirname:null,   //custom name
            forcedir:false, //force overwrite
            smppath:null    //absolute path
        };

        if(!ConfigMgr.get('ProjectsDirectory')){
            console.log("Save command: configuration parameter missing (ProjectsDirectory)");
            return this._error_code;
        }
        if(!ConfigMgr.get('Project')){
            console.log("Save command: configuration parameter missing (Project)");
            return this._error_code;
        }

        C_save_options.dirname = this.cli_params.getOptionValue(ConfigMgr._cli_options.directory_name);
        if(this.cli_params.hasOption(ConfigMgr._cli_options.directory_name) && !C_save_options.dirname){
            console.log("Save command: directory name missing");
            return this._error_code;
        }
        if(this.cli_params.hasOption(ConfigMgr._cli_options.force)){
            C_save_options.forcedir = true;
        }

        let smp_obj = SamplesMgr.openLookupFile();
        if(!_.isObject(smp_obj)){
            console.log("Save command: latest lookup missing");
            return this._error_code;
        }

        return SamplesMgr.generateSamplesDir(smp_obj,C_save_options);
    }


    C_coverage(){
        let C_coverage_options = {
            dirPath:null,       //custom path
            tagQuery:null,     //query tags
            getUncovered:true,
            consoleOutput:true,
            progressive:false,
            progressive_keepalive:false
        };

        C_coverage_options.dirPath = this.cli_params.getOptionValue(ConfigMgr._cli_options.directory_path);
        if(!C_coverage_options.dirPath){
            if(!SamplesMgr.sampleScanFileExists()){
                console.log("Coverage command: the index file does not exist.\n" +
                    "Perform a scan or specify an absolute path with "+ConfigMgr._cli_options.directory_path+" option.");
                return this._error_code;
            }
        }

        C_coverage_options.tagQuery = this.cli_params.getOptionValue(ConfigMgr._cli_options.tag_query);
        if(!C_coverage_options.tagQuery){
            if(!ConfigMgr.get('Tags')){
                console.log("Coverage command: no configured tags found.\n" +
                    "Add one or more tags or specify a custom query with "+ConfigMgr._cli_options.tag_query+" option.");
                return this._error_code;
            }
        }

        C_coverage_options.getUncovered = this.cli_params.getOptionValue(ConfigMgr._cli_options.selection);
        if(C_coverage_options.getUncovered=='covered') C_coverage_options.getUncovered=false;
        else C_coverage_options.getUncovered=true;

        C_coverage_options.progressive = this.cli_params.hasOption(ConfigMgr._cli_options.progressive);
        C_coverage_options.progressive_keepalive = this.cli_params.hasOption(ConfigMgr._cli_options.progressive_keepalive);

        let smp_obj = SamplesMgr.checkSamplesCoverage(C_coverage_options);
        if(!_.isObject(smp_obj)){
            console.log("Coverage command: something went wrong.");
            return this._error_code;
        }

        return smp_obj;
    }

};

module.exports = new CliManager();
