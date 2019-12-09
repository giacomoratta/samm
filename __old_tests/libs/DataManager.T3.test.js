const test_config = require('../require.js');
let UF = Utils.File;
let tmp_dir_utils_file = UF.pathJoin(configMgr.path('working_dir'),'utils_file');
let my_file1_required_abspath = UF.pathJoin(tmp_dir_utils_file,'my_file_required1.txt');
let my_file1_sample_abspath = UF.pathJoin(tmp_dir_utils_file,'my_file_sample1.txt');
let my_file2_required_abspath = UF.pathJoin(tmp_dir_utils_file,'my_file_required2.txt');
let my_file2_sample_abspath = UF.pathJoin(tmp_dir_utils_file,'my_file_sample2.txt');

describe('DataManager.class - Tests for special features', function() {
    describe("#setHolder('my_file_required1')", function() {
        it("set a file-only holder", function() {
            UF._FS_EXTRA.removeSync(my_file1_required_abspath);
            dataHolder.setHolder({
                label:'my_file_required1',
                filePath:my_file1_required_abspath,
                fileType:'text',
                cloneFrom:my_file1_sample_abspath
            });
            assert.equal(Utils.File.fileExistsSync(my_file1_required_abspath),false);
        });
        it("load the file-only holder", function() {
            dataHolder.load('my_file_required1');
            assert.equal(Utils.File.fileExistsSync(my_file1_required_abspath),true);
            UF._FS_EXTRA.removeSync(my_file1_required_abspath);
        });
    });

    describe("#setHolder('my_file_required2')", function() {
        it("set a file-only holder with preLoad and cloneFrom", function() {
            UF._FS_EXTRA.removeSync(my_file2_required_abspath);
            dataHolder.setHolder({
                label:'my_file_required2',
                filePath:my_file2_required_abspath,
                fileType:'text',
                cloneFrom:my_file2_sample_abspath,
                preLoad:true
            });
            assert.equal(Utils.File.fileExistsSync(my_file2_required_abspath),true);
            UF._FS_EXTRA.removeSync(my_file2_required_abspath);
        });
    });
});
