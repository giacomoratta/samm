/**
 * TEST for filesystem r/w operations
 */

const test_config = require('../require.js');
let UF = Utils.File;
let tmp_dir_utils_file = UF.pathJoin(ConfigMgr.path('temp_dir'),'utils_file');

// describe('Utils.File.singleton', function() {
//     describe("#readFileSync", function() {
//         it("read generic file", function() {
//             tLog('ck_file1 > ',ck_file1);
//             let ck_file1_content = UF.readFileSync(ck_file1);
//             tLog('\n',ck_file1_content);
//             assert.notEqual(ck_file1_content,false);
//             assert.equal(UF.readFileSync(ck_file1+'xxx'),false);
//         });
//
//     });
// });
