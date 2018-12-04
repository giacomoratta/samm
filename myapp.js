/* DAW Adapters */
global.DAW_Adapters = {};
global.DAW_Adapters.Ableton = require('./app_modules/daw.adapters/AbletonProject.class.js');
global.DAW_Adapters.Cubase = require('./app_modules/daw.adapters/CubaseProject.class.js');


/* Project Modules */
global.SamplesMgr = require('./app_modules/managers/SamplesManager.js');
global.DirCommand = require('./app_modules/managers/Dir.command.js');
global.BookmarksMgr = require('./app_modules/managers/BookmarksManager.js');
global.ProjectsMgr = require('./app_modules/managers/ProjectsManager.js');
global.TQueryMgr = require('./app_modules/managers/TQueryManager.js');
global.ExportMgr = require('./app_modules/managers/ExportManager.js');


require('./app_config/config.js');
require('./app_config/cli/config_cmd.js');

CliMgr.show('mpl');