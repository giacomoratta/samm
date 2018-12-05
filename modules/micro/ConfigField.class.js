
const ENUMS = {
    datatype: {
        integer:1,
        number:2,
        boolean:3,
        char:4,
        string:5,
        array:6,
        relpath:7,
        abspath:8
    },

};

// set value
// check value
// check path exists
// check others...
//   if ok call setSuccessFn
//   if no call setFailFn -> exitOnErrorFn
// return true/false


class ConfigField {
    constructor(field_cfg){
        this._field_cfg = null;

        let fcfg = _.merge({
            datatype: 'integer', //abspath, relpath, number, boolean, string, array, char
            arrayDatatype: null, //ENUM!!!

            checkFn: null,
            checkArrayFn: null,
            checkPathExists: false, //only for path
            _exitOnErrorFn: null, //set by configmgr
            exitOnError: false, //used by configmgr

            defaultValue: '',
            setSuccessFn: null,
            setFailFn: null,

        },field_cfg);

        fcfg.checkFn = this._setCheckFn(fcfg.checkFn, fcfg.datatype);
        fcfg.checkArrayFn = this._setCheckFn(fcfg.checkArrayFn, fcfg.arrayDatatype);

        // set and check default value, checkpathexists
    }


    _setCheckFn(checkFn, datatype){

        let datatype_code = (_.isString(datatype)?ENUMS.datatype[datatype]:null);

        if(!_.isFunction(checkFn)){
            if(datatype_code === ENUMS.datatype.integer){

            }
            switch(datatype_code) {
                case ENUMS.datatype.integer:
                    break;
                case ENUMS.datatype.number:
                    break;
                case ENUMS.datatype.boolean:
                    break;
                case ENUMS.datatype.char:
                    break;
                case ENUMS.datatype.string:
                    break;
                case ENUMS.datatype.array:
                    break;
                case ENUMS.datatype.relpath:
                    break;
                case ENUMS.datatype.abspath:
                    break;
                default:
                //errorFn
            }
        }
    }


}


module.exports = ConfigField;
