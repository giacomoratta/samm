require('./config_init.js')

/* Singleton Objects */
global.SamplesTree = require('../app/managers/SamplesTree.class.js')

/* Data Types */
global.Samples = require('../app/atoms/Samples.class.js')

/* Project Modules */
global.SamplesMgr = require('../app/managers/SamplesManager.js')
global.DirCommand = require('../app/managers/Dir.command.js')
global.BookmarksMgr = require('../app/managers/BookmarksManager.js')
global.ProjectsMgr = require('../app/managers/ProjectsManager.js')
global.TQueryMgr = require('../app/managers/TQueryManager.js')
global.ExportMgr = require('../app/managers/ExportManager.js')

require('../interfaces/cli_sections/bookm_cmd.js')
require('../interfaces/cli_sections/config_cmd.js')
require('../interfaces/cli_sections/coverage_cmd.js')
require('../interfaces/cli_sections/dir_cmd.js')
require('../interfaces/cli_sections/export_cmd.js')
require('../interfaces/cli_sections/lookup_cmd.js')
require('../interfaces/cli_sections/project_cmd.js')
require('../interfaces/cli_sections/samples_cmd.js')
require('../interfaces/cli_sections/save_cmd.js')
require('../interfaces/cli_sections/scan_cmd.js')
require('../interfaces/cli_sections/tquery_cmd.js')

/* Last command: start CLI! */
cliMgr.show('mpl')
