let _config = {
    window: {

    },
    osx:{

    }
};

let _loaded_cfg = require('../config.json');
let _ = require('lodash');

_config = _.merge(_loaded_cfg,_config.osx);

module.exports = _config;