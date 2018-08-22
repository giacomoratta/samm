/**
 * TEST for file and directory read/write
 */

const test_config = require('../require.js');
let UF = Utils.File;
let ck_file1 = UF.pathJoin(ConfigMgr.path('temp_dir'),'file1.txt');
let ck_file1_json = UF.pathJoin(ConfigMgr.path('temp_dir'),'file1.json');
let ck_file1_bad_json = UF.pathJoin(ConfigMgr.path('temp_dir'),'file1.bad.json');
let ck_directory1 = UF.pathJoin(ConfigMgr.path('temp_dir'),'directory1');
let ck_directory1_file11 = UF.pathJoin(ConfigMgr.path('temp_dir'),'directory1','file11.txt');

describe('Utils.File.singleton', function() {
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
        });

        it("read bad json file", function() {
            tLog('ck_file1_bad_json > ',ck_file1_bad_json);
            let ck_file1_content = UF.readJsonFileSync(ck_file1_bad_json);
            tLog('content',ck_file1_content);
            assert.notEqual(ck_file1_content,false);
            assert.equal(ck_file1_content,null);
        });
    });
});
