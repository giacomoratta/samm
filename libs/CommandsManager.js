
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

        if(!Config.checkProperty(cli_params[1])){
            console.log("Set command: unknown property name '"+cli_params[1]+"'");
            return this._error_code;
        }

        let _new_prop_val=cli_params[2];
        if(_.isNil(_new_prop_val)){
            console.log("Set command: missing value for property");
            return this._error_code;
        }

        //if(!(_.isNumber(_new_prop_val) || _.isString(_new_prop_val) || _.isNull(_new_prop_val))){ //TODO:better check and conversion
        //    console.log('Set command: wrong new property value');
        //    return this._error_code;
        //}
        //}

        Config.setProperty(cli_params[1],_.slice(cli_params,2));
        Config.save();
    }
};

module.exports = new CommandsManager();
