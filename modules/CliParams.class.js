class CliParams {

    constructor(values, command, rawdata){
        this._error = true;
        if(rawdata===true){
            this.initRawData(values,command);
            return;
        }
        this.init(values,command);
    }

    isError(){
        return this._error;
    }

    initRawData(values, command){
        this.command = command;
        this.options = {};
        if(!_.isString(values)) return;
        // split with space
        // check options and values
        // single values
        this._error = false;
    }

    init(values, command){
        this._error = true;
        this.command = null;
        this.params =  { _:[] };
        if(!_.isObject(values)) return;

        this.command = command;
        this.options = values.options;
        delete values.options;
        this.params = values;
        this._error = false;

        /*
        this.params has the same data-format returned by minimist library.
        {
            _: [ array of values ],
            opt1: true (if does not have a value, just to check the presence)
            opt2: 'value',
            opt2: 12321, (already converted)
            opt2: 123.21
        }
        */
    }

    hasOption(o){
        return (!_.isNil(this.options[o]));
    }


    get(i){
        if(!_.isNil(this.params[i])) return this.params[i];
        return null;
    }

    getOption(o){
        if(!_.isNil(this.options[o])) return this.options[o];
        return null;
    }
}

module.exports = CliParams;