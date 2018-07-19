
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
        ConfigMgr.setProperty(cli_params[1],_.slice(cli_params,2));
        ConfigMgr.save();
    }


    C_scan(cli_params){
        let smp_obj = SamplesMgr.scanSamples();
        if(!smp_obj){
            console.log("Scan command: scansion failed");
            return this._error_code;
        }
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

        let tagList=null;
        if(cli_params[1]=='-t'){
            if(cli_params.length<3){
                console.log("Lookup command: missing tag name after option -t");
                return this._error_code;
            }
            let _tagList = ConfigMgr.getProperty('tags')[cli_params[2]];
            if(_.isNil(_tagList)){
                console.log("Lookup command: unknown tag name after option -t");
                return this._error_code;
            }
            tagList = _.split(_tagList,',');

        } else {
            tagList = _.slice(cli_params,1);
        }

        let smp_obj_scan = SamplesMgr.loadSampleScanFromFile();
        if(!smp_obj_scan){
            console.log("Lookup command: no sample scan found");
            return this._error_code;
        }
        ConfigMgr._sampleScan = smp_obj_scan.array;

        if(_.isNil(tagList)) return null;
        let smp_obj = SamplesMgr.searchSamplesByTags(_.slice(cli_params,1));
        SamplesMgr.saveSampleObjectToFile(smp_obj);
        return smp_obj;
    }


    C_save(cli_params){
        let smp_dirname = null;
        let smp_obj = SamplesMgr.openSampleObjectToFile();
        if(cli_params[1]=='-n'){
            if(_.isNil(cli_params[2])){
                console.log("Save command: directory name missing");
                return this._error_code;
            }
            smp_dirname = cli_params[2];
        }
        if(!_.isObject(smp_obj)){
            console.log("Save command: latest lookup missing");
            return this._error_code;
        }
        return SamplesMgr.generateSamplesDir(smp_obj,smp_dirname);
    }
};

module.exports = new CommandsManager();
