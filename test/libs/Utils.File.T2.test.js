/**
 * TEST for file and directory read/write
 */

const test_config = require('../require.js');
let UF = Utils.File;
let _temp_path_checkAndSetDuplicatedDirectoryName = UF.pathJoin(ConfigMgr.path('temp_dir'),'checkAndSetDuplicatedDirectoryName');

describe('Utils.File.singleton', function() {
    describe("#existence", function() {
        it("check if some file system nodes exist", function() {
            let ck_file1 = UF.pathJoin(ConfigMgr.path('temp_dir'),'file1.txt');
            let ck_directory1 = UF.pathJoin(ConfigMgr.path('temp_dir'),'directory1');
            let ck_directory1_file11 = UF.pathJoin(ConfigMgr.path('temp_dir'),'directory1','file11.txt');

            tLog('file exists > ',ck_file1);
            assert.equal(UF.fileExists(ck_file1),true);
            assert.equal(UF.fileExists(ck_file1+'xxx'),false);

            tLog('directory exists > ',ck_directory1);
            assert.equal(UF.directoryExists(ck_directory1),true);
            assert.equal(UF.directoryExists(ck_directory1+'xxx'),false);

            tLog('file exists > ',ck_directory1_file11);
            assert.equal(UF.fileExists(ck_directory1_file11),true);
            assert.equal(UF.fileExists(ck_directory1_file11+'xxx'),false);
        });
    });
});
