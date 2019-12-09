// const test_config = require('../require.js');
// let fileUtils = Utils.File;
// let _temp_path_checkAndSetDuplicatedDirectoryNameSync= fileUtils.pathJoin(configMgr.path('working_dir'),'checkAndSetDuplicatedDirectoryNameSync');
// let tmp_dir_utils_file = fileUtils.pathJoin(configMgr.path('working_dir'),'utils_file');
// let ck_file1 = fileUtils.pathJoin(tmp_dir_utils_file,'file1.txt');
// let ck_directory1 = fileUtils.pathJoin(tmp_dir_utils_file,'directory1');
// let ck_directory1_file11 = fileUtils.pathJoin(tmp_dir_utils_file,'directory1','file11.txt');

const fileUtils = require('../file.utils')

describe('Utils.File.singleton', function() {

    it("should handle absolute paths", function() {
        const path_file11_std = fileUtils.setAsAbsPath('file_utils_test_dir/directory1/file11.txt',true)
        const path_file11_local = fileUtils.setAsAbsPath('file_utils_test_dir/directory1/file11.txt',true)
        const path_dir2_std = fileUtils.setAsAbsPath('./file_utils_test_dir/directory1/directory2')
        const path_dir2_local = fileUtils.setAsAbsPath('./file_utils_test_dir/directory1/directory2')
        const path_file_custom_dir = fileUtils.setAsAbsPath('./file_utils_test_dir/directory1/file11.txt',false,'/custom/dir')
        const path_dir_custom_dir = fileUtils.setAsAbsPath('./file_utils_test_dir/directory1/directory2',false,'/custom/dir')

        console.log(__dirname,path_file11_std)


        // tLog(fileUtils.getAbsPath());
        // let ap = null;
        // ap = fileUtils.setAsAbsPath('other/directory'); tLog(ap); assert.equal(ap.endsWith(fileUtils.pathSeparator),true);
        // ap = fileUtils.setAsAbsPath('/other/directory/'); tLog(ap); assert.equal(ap.endsWith(fileUtils.pathSeparator),true);
        // ap = fileUtils.setAsAbsPath('/other/directory/'); tLog(ap); assert.equal(ap.endsWith(fileUtils.pathSeparator),true);
        // ap = fileUtils.setAsAbsPath('other/file',true); tLog(ap); assert.equal(ap.endsWith(fileUtils.pathSeparator),false);
        // ap = fileUtils.setAsAbsPath('other/file/',true); tLog(ap); assert.equal(ap.endsWith(fileUtils.pathSeparator),false);
        // ap = fileUtils.setAsAbsPath('/other/file',true); tLog(ap); assert.equal(ap.endsWith(fileUtils.pathSeparator),false);
        // ap = fileUtils.setAsAbsPath('other/file.txt',true); tLog(ap); assert.equal(ap.endsWith(fileUtils.pathSeparator),false);
        // ap = fileUtils.setAsAbsPath('other/file/.txt',true); tLog(ap); assert.equal(ap.endsWith(fileUtils.pathSeparator),false);
        // ap = fileUtils.setAsAbsPath('/other/file.txt',true); tLog(ap); assert.equal(ap.endsWith(fileUtils.pathSeparator),false);
    })

    describe("#checkAndSetDuplicatedDirectoryNameSync", function() {
        it("check if the directory exists and set another name to avoid collisions", function() {
            // let base_dir = _temp_path_checkAndSetDuplicatedDirectoryNameSync;
            // fileUtils._FS_EXTRA.removeSync(base_dir);
            //
            // assert.equal(fileUtils.checkAndSetDuplicatedDirectoryNameSync(324352/*wrong type*/),null);
            //
            // tLog(base_dir);
            // assert.equal(fileUtils.checkAndSetDuplicatedDirectoryNameSync(base_dir),base_dir);
            // fileUtils.ensureDirSync(base_dir);
            //
            // let new_dir1 = fileUtils.checkAndSetDuplicatedDirectoryNameSync(base_dir);
            // tLog('D1',new_dir1);
            // assert.notEqual(new_dir1,base_dir);
            // fileUtils.ensureDirSync(new_dir1);
            //
            // let new_dir2 = fileUtils.checkAndSetDuplicatedDirectoryNameSync(base_dir);
            // tLog('D2',new_dir2);
            // assert.notEqual(new_dir2,base_dir);
            // assert.notEqual(new_dir2,new_dir1);
            // fileUtils.ensureDirSync(new_dir2);
            //
            // fileUtils._FS_EXTRA.removeSync(base_dir);
            // fileUtils._FS_EXTRA.removeSync(new_dir1);
            // fileUtils._FS_EXTRA.removeSync(new_dir2);
        })
    })

    describe("#checkAndSetPathSync", function() {
        it("check if the path exists", function() {
            // let base_dir = configMgr.path('working_dir');
            // let base_dir_no_sep = base_dir.substring(0,base_dir.length-1);
            // tLog('base_dir > ',base_dir);
            // tLog('base_dir_no_sep > ',base_dir_no_sep);
            // assert.equal(fileUtils.checkAndSetPathSync(base_dir),base_dir);
            // assert.equal(fileUtils.checkAndSetPathSync(base_dir+'not_exist'),null);
            // let base_dir_no_sep_corrected = fileUtils.checkAndSetPathSync(base_dir_no_sep);
            // assert.notEqual(base_dir_no_sep,base_dir_no_sep_corrected);
            // tLog('base_dir_no_sep_corrected > ',base_dir_no_sep_corrected);
        })
    })

    describe("#existence", function() {
        it("check if some file system nodes exist", function() {

            // tLog('file exists > ',ck_file1);
            // assert.equal(fileUtils.fileExistsSync(ck_file1),true);
            // assert.equal(fileUtils.fileExistsSync(ck_file1+'xxx'),false);
            //
            // tLog('directory exists > ',ck_directory1);
            // assert.equal(fileUtils.directoryExistsSync(ck_directory1),true);
            // assert.equal(fileUtils.directoryExistsSync(ck_directory1+'xxx'),false);
            //
            // tLog('file exists > ',ck_directory1_file11);
            // assert.equal(fileUtils.fileExistsSync(ck_directory1_file11),true);
            // assert.equal(fileUtils.fileExistsSync(ck_directory1_file11+'xxx'),false);
        })
    })
})
