
const ENUMS = {
    datatype: {
        integer:1,
        number:2,
        boolean:3,
        char:4,
        string:5,
        array:6,
        object:7,
        relpath:8,
        abspath:9
    }
};

let x$ = d$;

class ConfigField {
    constructor(field_cfg){
        this._field_cfg = null;
        this._value = null;

        let fcfg = _.merge({
            datatype: 'string',
            objectDatatype: null,
            defaultValue: null,
            allowedValues: [],

            checkFn: null,
            checkObjectFn: null,
            checkPathExists: false, //only for path

            setSuccessFn: null,
            setFailFn: null

            // datatypeCode - integer, set privately
            // objectDatatypeCode  - integer, set privately
            // setFn: null,  - function, set privately

        },field_cfg);



        if(!this._setDatatype(fcfg.datatype, fcfg.objectDatatype, fcfg)) return;

        fcfg.checkObjectFn = this._setCheckFn(fcfg.checkObjectFn, fcfg.objectDatatypeCode, fcfg);
        fcfg.checkFn = this._setCheckFn(fcfg.checkFn, fcfg.datatypeCode, fcfg, fcfg.checkObjectFn);
        if(!fcfg.checkFn) return;

        fcfg.setFn = this._setSetFn(fcfg.checkFn, fcfg.checkObjectFn, fcfg);

        this._field_cfg = fcfg;
        if(!this.set(fcfg.defaultValue)){
            d$('ConfigField.constructor','invalid default value',fcfg.defaultValue);
            this._value = null;
            this._field_cfg = null;
            //x$(fcfg);
            return;
        }
        //x$(fcfg);
    }


    error(){
        return (this._field_cfg===null || this._value===null);
    }


    get(){
        return this._value;
    }

    set(v, addt){
        let _return_value = this._field_cfg.setFn(v, addt, this._value, this._field_cfg.allowedValues);
        if(_.isNil(_return_value)){
            if(this._field_cfg.setFailFn) this._field_cfg.setFailFn();
            return false;
        }
        this._value = _return_value;
        if(this._field_cfg.setSuccessFn) this._field_cfg.setSuccessFn();
        return true;
    }


    allowedValues(){
        if(!_.isArray(this._field_cfg.allowedValues) || this._field_cfg.allowedValues.length<1) return null;
        return this._field_cfg.allowedValues;
    }


    _setDatatype(datatype, objectDatatype, _fcfg){
        if(!ENUMS.datatype[datatype]){
            d$('_setDatatype: no valid datatype',datatype);
            return null;
        }
        let object_datatype_code = null;
        let datatype_code = ENUMS.datatype[datatype];
        if(datatype_code===ENUMS.datatype.array){
            if(!ENUMS.datatype[objectDatatype]){
                d$('_setDatatype: no valid objectDatatype',objectDatatype);
                return null;
            }
            object_datatype_code = ENUMS.datatype[objectDatatype];
            if(object_datatype_code === ENUMS.datatype.array) {
                d$('_setDatatype: objectDatatype cannot be array!');
                return null;
            }
        }
        if(_fcfg){
            _fcfg.datatype = datatype;
            _fcfg.objectDatatype = objectDatatype;
            _fcfg.datatypeCode = datatype_code;
            _fcfg.objectDatatypeCode = object_datatype_code;
            return true;
        }
        return {
            datatype:datatype,
            objectDatatype:objectDatatype,
            datatypeCode: datatype_code,
            objectDatatypeCode:object_datatype_code
        }
    }


    _setCheckFn(checkFn, datatypeCode, _fcfg, _checkObjectFn){
        if(!datatypeCode) return null;
        if(!_.isFunction(checkFn)){
            switch(datatypeCode) {
                case ENUMS.datatype.integer:
                    checkFn = function(v){ return _.isInteger(v); };
                    break;
                case ENUMS.datatype.number:
                    checkFn = function(v){ return _.isNumber(v); };
                    break;
                case ENUMS.datatype.boolean:
                    checkFn = function(v){ return _.isBoolean(v); };
                    break;
                case ENUMS.datatype.char:
                    checkFn = function(v){ return (_.isString(v) && v.length<=1); };
                    break;
                case ENUMS.datatype.string:
                    checkFn = function(v){ return _.isString(v); };
                    break;
                case ENUMS.datatype.array:
                    if(!_.isFunction(_checkObjectFn)) {
                        return null;
                    }
                    checkFn = function(v){
                        if(!_.isArray(v)) return false;
                        for(let i=0; i<v.length; i++){
                            if(!_checkObjectFn(v[i])) return false;
                        }
                        return true;
                    };
                    break;
                case ENUMS.datatype.object:
                    if(!_.isFunction(_checkObjectFn)) {
                        return null;
                    }
                    checkFn = function(v){
                        if(!_.isObject(v)) return false;
                        for(let i=0; i<v.length; i++){
                            if(!_checkObjectFn(v[i])) return false;
                        }
                        return true;
                    };
                    break;
                case ENUMS.datatype.relpath:
                    if(!_fcfg || !_fcfg.checkPathExists) checkFn = function(v){
                        if(_.isString(v) && v.length===0) return true;
                        return Utils.File.isRelativePath(v);
                    };
                    else checkFn = function(v){
                        if(_.isString(v) && v.length===0) return true;
                        return (Utils.File.isRelativePath(v) && Utils.File.directoryExistsSync(v));
                    };
                    break;
                case ENUMS.datatype.abspath:
                    if(!_fcfg || !_fcfg.checkPathExists) checkFn = function(v){
                        if(_.isString(v) && v.length===0) return true;
                        return Utils.File.isAbsolutePath(v);
                    };
                    else checkFn = function(v){
                        if(_.isString(v) && v.length===0) return true;
                        return (Utils.File.isAbsolutePath(v) && Utils.File.directoryExistsSync(v));
                    };
                    break;
                default:
                    //should never happens
            }
        }
        return checkFn;
    }


    _setSetFn(checkFn, checkObjectFn, _fcfg){
        // addt = 'i', 'd', object key
        let allowedValuesFn = function(v, awv){
            if(!awv) return true;
            if(awv.indexOf(v)>=0) return true;
            return false;
        };
        let setFn = function(v, awv){
            if(!checkFn(v)) return null;
            //if(!allowedValuesFn(v, awv)) return null;
            return v;
        };
        if(_fcfg.datatypeCode === ENUMS.datatype.array){
            setFn = function(v, addt, _ref, awv){
                if(checkFn(v)){
                    // TODO: check all values allowedValuesFn
                    if(_.isNil(addt)) return v;
                }else{
                    v = [v];
                }
                if(addt==='i'){
                    for(let i=0; i<v.length; i++){
                        if(!checkObjectFn(v[i])) return null;
                        if(!allowedValuesFn(v[i], awv)) return null;
                        _ref.push(v[i]);
                    }
                }
                else if(addt==='d'){
                    for(let i=0; i<v.length; i++){
                        let j = _ref.indexOf(v[i]);
                        _ref.splice(j,1);
                    }
                }
                return _ref;
            };
        }
        else if(_fcfg.datatypeCode === ENUMS.datatype.object){
            setFn = function(v, addt, _ref, awv){
                if(checkFn(v)){
                    // TODO: check all values allowedValuesFn
                    return v;
                }
                if(!_.isString(addt)) return null;
                if(!_.isNil(v)){
                    delete _ref[addt];
                    return _ref;
                }
                if(!checkObjectFn(v)) return null;
                if(!allowedValuesFn(v, awv)) return null;
                _ref[addt] = v;
                return _ref;
            };
        }
        return setFn;
    }


}


module.exports = ConfigField;
