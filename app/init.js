/* DAW Adapters */
global.DAW_Adapters = {};
global.DAW_Adapters.Ableton = require('./daw.adapters/AbletonProject.class.js');
global.DAW_Adapters.Cubase = require('./daw.adapters/CubaseProject.class.js');


/* Project Modules */
global.SamplesMgr = require('./managers/SamplesManager.js');
global.DirCommand = require('./managers/Dir.command.js');
global.BookmarksMgr = require('./managers/BookmarksManager.js');
global.ProjectsMgr = require('./managers/ProjectsManager.js');
global.TQueryMgr = require('./managers/TQueryManager.js');
global.ExportMgr = require('./managers/ExportManager.js');


require('./config.js');

require('./cli_sections/config_cmd.js');

CliMgr.show('mpl');