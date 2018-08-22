const test_config = require('../require.js');
let UF = Utils.File;
let tmp_dir_utils_file = UF.pathJoin(ConfigMgr.path('temp_dir'),'utils_file');
let ck_file1 = UF.pathJoin(tmp_dir_utils_file,'file1.txt');
let ck_file2 = UF.pathJoin(tmp_dir_utils_file,'file2.txt');
let ck_file1_json = UF.pathJoin(tmp_dir_utils_file,'file1.json');
let ck_file2_json = UF.pathJoin(tmp_dir_utils_file,'file2.json');
let ck_file1_bad_json = UF.pathJoin(tmp_dir_utils_file,'file1.bad.json');
let ck_directory1 = UF.pathJoin(tmp_dir_utils_file,'directory1');
let ck_directory2 = UF.pathJoin(tmp_dir_utils_file,'directory2');
let ck_directory1_file11 = UF.pathJoin(tmp_dir_utils_file,'directory1','file11.txt');
let ck_directory2_file11 = UF.pathJoin(tmp_dir_utils_file,'directory2','file11.txt');
let ck_file2_content = "new2\ncontent2";
let ck_file2_json_content = { array:[1,2,3], str:'newcontent222' };

describe('Utils.File.singleton - TEST for file read/write', function() {
    describe("#readFileSync", function() {
        it("read generic file", function() {
            tLog('ck_file1 > ',ck_file1);
            let ck_file1_content = UF.readFileSync(ck_file1);
            tLog('\n',ck_file1_content);
            assert.notEqual(ck_file1_content,false);
            assert.equal(UF.readFileSync(ck_file1+'xxx'),false);
        });

        it("read text file", function() {
            tLog('ck_file1 > ',ck_file1);
            let ck_file1_content = UF.readTextFileSync(ck_file1);
            tLog('\n',ck_file1_content);
            assert.notEqual(ck_file1_content,false);
            assert.equal(_.isString(ck_file1_content),true);
            assert.equal(ck_file1_content.length>0,true);
        });

        it("read json file", function() {
            tLog('ck_file1_json > ',ck_file1_json);
            let ck_file1_content = UF.readJsonFileSync(ck_file1_json);
            tLog('\n',ck_file1_content);
            assert.notEqual(ck_file1_content,false);
            assert.notEqual(ck_file1_content,null);
            assert.equal(ck_file1_content.array.length>0,true);
            assert.equal(UF.readFileSync(ck_file1_json+'xxx'),false);
            assert.notEqual(UF.readFileSync(ck_file1_json+'xxx'),null);
        });

        it("read bad json file", function() {
            tLog('ck_file1_bad_json > ',ck_file1_bad_json);
            let ck_file1_content = UF.readJsonFileSync(ck_file1_bad_json);
            tLog('content',ck_file1_content);
            assert.notEqual(ck_file1_content,false);
            assert.equal(ck_file1_content,null);
            assert.equal(UF.readFileSync(ck_file1_bad_json+'xxx'),false);
            assert.notEqual(UF.readFileSync(ck_file1_bad_json+'xxx'),null);
        });
    });

    describe("#writeFileSync", function() {
        it("write generic file", function() {
            tLog('ck_file2 > ',ck_file2);
            tLog('\nFile content:\n'+ck_file2_content);
            assert.equal(UF.writeFileSync(ck_file2,ck_file2_content),true);
            let re_read_ck_file2 = UF.readFileSync(ck_file2);
            assert.notEqual(re_read_ck_file2,false);
            assert.notEqual(re_read_ck_file2,null);
            assert.equal(ck_file2_content,re_read_ck_file2);
            UF._FS_EXTRA.removeSync(ck_file2);
        });

        it("write text file", function() {
            tLog('ck_file2 > ',ck_file2);
            tLog('\nFile content:\n'+ck_file2_content);
            assert.equal(UF.writeTextFileSync(ck_file2,ck_file2_content),true);
            let re_read_ck_file2 = UF.readTextFileSync(ck_file2);
            assert.notEqual(re_read_ck_file2,false);
            assert.notEqual(re_read_ck_file2,null);
            assert.equal(ck_file2_content,re_read_ck_file2);
            UF._FS_EXTRA.removeSync(ck_file2);
        });

        it("write json file", function() {
            tLog('ck_file2 > ',ck_file2_json);
            tLog('\nFile content:\n'+ck_file2_json_content);
            assert.equal(UF.writeJsonFileSync(ck_file2_json,'bad'+ck_file2_json_content),false);
            assert.equal(UF.writeJsonFileSync(ck_file2_json,ck_file2_json_content),true);
            let re_read_ck_file2 = UF.readJsonFileSync(ck_file2_json);
            assert.notEqual(re_read_ck_file2,false);
            assert.notEqual(re_read_ck_file2,null);
            assert.deepEqual(ck_file2_json_content,re_read_ck_file2);
            UF._FS_EXTRA.removeSync(ck_file2_json)
        });
    });
});
