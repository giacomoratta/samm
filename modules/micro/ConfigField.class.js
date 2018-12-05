
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

class ConfigField {
    constructor(field_cfg){
        this._field_cfg = null;

        let fcfg = _.merge({
            datatype:'integer', //abspath, relpath, number, boolean, string, array, char
            arrayDatatype:'string', //ENUM!!!
            defaultValue:'',
            checkPathExists: true, //only for path
            exitOnError: false,
            checkFn:null,
            checkArrayFn:null,
            setSuccessFn:null, //setFlag, printMessages
            setFailFn:null,
        },field_cfg);

        fcfg._datatype = ENUMS.datatype[fcfg.datatype];

        // CHECK_FN
        if(!_.isFunction(fcfg.checkFn)){
            if(fcfg._datatype === ENUMS.datatype.integer){

            }
            switch(fcfg._datatype) {
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
