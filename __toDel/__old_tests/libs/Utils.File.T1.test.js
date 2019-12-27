const test_config = require('../require.js');
let UF = Utils.File;
let _temp_path_checkAndSetDuplicatedDirectoryNameSync= UF.pathJoin(configMgr.path('working_dir'),'checkAndSetDuplicatedDirectoryNameSync');
let tmp_dir_utils_file = UF.pathJoin(configMgr.path('working_dir'),'utils_file');
let ck_file1 = UF.pathJoin(tmp_dir_utils_file,'file1.txt');
let ck_directory1 = UF.pathJoin(tmp_dir_utils_file,'directory1');
let ck_directory1_file11 = UF.pathJoin(tmp_dir_utils_file,'directory1','file11.txt');

describe('Utils.File.singleton - TEST for existence, ensure directories, path fixing', function() {
    describe("#getAbsPath + #setAsAbsPath", function() {
        it("show the current absolute path", function() {
            tLog(UF.getAbsPath());
            let ap = null;
            ap = UF.setAsAbsPath('other/directory'); tLog(ap); assert.equal(ap.endsWith(UF.pathSeparator),true);
            ap = UF.setAsAbsPath('/other/directory/'); tLog(ap); assert.equal(ap.endsWith(UF.pathSeparator),true);
            ap = UF.setAsAbsPath('/other/directory/'); tLog(ap); assert.equal(ap.endsWith(UF.pathSeparator),true);
            ap = UF.setAsAbsPath('other/file',true); tLog(ap); assert.equal(ap.endsWith(UF.pathSeparator),false);
            ap = UF.setAsAbsPath('other/file/',true); tLog(ap); assert.equal(ap.endsWith(UF.pathSeparator),false);
            ap = UF.setAsAbsPath('/other/file',true); tLog(ap); assert.equal(ap.endsWith(UF.pathSeparator),false);
            ap = UF.setAsAbsPath('other/file.txt',true); tLog(ap); assert.equal(ap.endsWith(UF.pathSeparator),false);
            ap = UF.setAsAbsPath('other/file/.txt',true); tLog(ap); assert.equal(ap.endsWith(UF.pathSeparator),false);
            ap = UF.setAsAbsPath('/other/file.txt',true); tLog(ap); assert.equal(ap.endsWith(UF.pathSeparator),false);
        });
    });

    describe("#checkAndSetDuplicatedDirectoryNameSync", function() {
        it("check if the directory exists and set another name to avoid collisions", function() {
            let base_dir = _temp_path_checkAndSetDuplicatedDirectoryNameSync;
            UF._FS_EXTRA.removeSync(base_dir);

            assert.equal(UF.checkAndSetDuplicatedDirectoryNameSync(324352/*wrong type*/),null);

            tLog(base_dir);
            assert.equal(UF.checkAndSetDuplicatedDirectoryNameSync(base_dir),base_dir);
            UF.ensureDirSync(base_dir);

            let new_dir1 = UF.checkAndSetDuplicatedDirectoryNameSync(base_dir);
            tLog('D1',new_dir1);
            assert.notEqual(new_dir1,base_dir);
            UF.ensureDirSync(new_dir1);

            let new_dir2 = UF.checkAndSetDuplicatedDirectoryNameSync(base_dir);
            tLog('D2',new_dir2);
            assert.notEqual(new_dir2,base_dir);
            assert.notEqual(new_dir2,new_dir1);
            UF.ensureDirSync(new_dir2);

            UF._FS_EXTRA.removeSync(base_dir);
            UF._FS_EXTRA.removeSync(new_dir1);
            UF._FS_EXTRA.removeSync(new_dir2);
        });
    });

    describe("#checkAndSetPathSync", function() {
        it("check if the path exists", function() {
            let base_dir = configMgr.path('working_dir');
            let base_dir_no_sep = base_dir.substring(0,base_dir.length-1);
            tLog('base_dir > ',base_dir);
            tLog('base_dir_no_sep > ',base_dir_no_sep);
            assert.equal(UF.checkAndSetPathSync(base_dir),base_dir);
            assert.equal(UF.checkAndSetPathSync(base_dir+'not_exist'),null);
            let base_dir_no_sep_corrected = UF.checkAndSetPathSync(base_dir_no_sep);
            assert.notEqual(base_dir_no_sep,base_dir_no_sep_corrected);
            tLog('base_dir_no_sep_corrected > ',base_dir_no_sep_corrected);
        });
    });

    describe("#existence", function() {
        it("check if some file system nodes exist", function() {

            tLog('file exists > ',ck_file1);
            assert.equal(UF.fileExistsSync(ck_file1),true);
            assert.equal(UF.fileExistsSync(ck_file1+'xxx'),false);

            tLog('directory exists > ',ck_directory1);
            assert.equal(UF.directoryExistsSync(ck_directory1),true);
            assert.equal(UF.directoryExistsSync(ck_directory1+'xxx'),false);

            tLog('file exists > ',ck_directory1_file11);
            assert.equal(UF.fileExistsSync(ck_directory1_file11),true);
            assert.equal(UF.fileExistsSync(ck_directory1_file11+'xxx'),false);
        });
    });
});
