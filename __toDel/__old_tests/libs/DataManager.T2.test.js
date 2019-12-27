const test_config = require('../require.js');
let UF = Utils.File;
let tmp_dir_utils_file = UF.pathJoin(configMgr.path('working_dir'),'utils_file');
let my_file1_abspath = UF.pathJoin(tmp_dir_utils_file,'my_file1.txt');

describe('DataManager.class - Tests for a file-only holder', function() {
    describe("#setHolder('my_file1')", function() {
        it("set a file-only holder", function() {
            dataFileHolder.setHolder({
                label:'my_file1',
                filePath:my_file1_abspath,
                fileType:'text',
                dataType:'string',
                logErrorsFn:console.log
            });
            UF._FS_EXTRA.removeSync(dataFileHolder.$cfg('my_file1').filePath);
        });
    });

    describe("#checkContainer('my_file1')", function() {
        it("check the file-only holder", function() {
            assert.equal(dataFileHolder.hasData('my_file1'),false);
            assert.equal(dataFileHolder.hasHolder('my_file1'),true);
        });
    });

    describe("#get('my_file1')", function() {
        it("get the data of the file-only holder;\n\t should not find data and should not call loadFn and setFn", function() {
            assert.equal(dataFileHolder.get('my_file1'),null);
        });
    });

    describe("#save('my_file1')", function() {
        it("save the data of the file-only holder - should not find data and should not call saveFn", function() {
            assert.equal(dataFileHolder.save('my_file1'),null);
        });
    });

    describe("#load('my_file1') #1", function() {
        it("should call loadFn but the file does not exist", function() {
            assert.equal(dataFileHolder.load('my_file1'),false);
        });
    });

    describe("#set('my_file1')", function() {
        it("should call setFn", function() {
            let my_file1 = dataFileHolder.set('my_file1','This is my text on my_file1');
            tLog(my_file1);
            assert.notEqual(my_file1,null);
            assert.notEqual(my_file1,undefined);
            assert.equal(_.isString(my_file1),true);
        });
    });

    describe("#save('my_file1')", function() {
        it("should call saveFn", function() {
            let mf = dataFileHolder.save('my_file1');
            assert.equal(mf,true);
        });
    });

    describe("#load('my_file1') #2", function() {
        it("should call loadFn and check file content", function() {
            let file_content = null;
            file_content = dataFileHolder.load('my_file1');
            tLog(file_content);
            assert.equal(_.isString(file_content),true);
            assert.equal(file_content,'This is my text on my_file1');

            file_content = dataFileHolder.get('my_file1');
            tLog(file_content);
            assert.equal(_.isString(file_content),true);
            assert.equal(file_content,'This is my text on my_file1');
        });
    });

    describe("#load('my_file1_clone') #1", function() {
        it("should call loadFn and check file content", function() {
            dataFileHolder.setHolder({
                label:'my_file1_clone',
                filePath:my_file1_abspath,
                fileType:'text',
                dataType:'string',
                logErrorsFn:console.log
            });
            let file_content = null;
            file_content = dataFileHolder.load('my_file1_clone');
            tLog('1>',file_content);
            assert.equal(_.isString(file_content),true);
            assert.equal(file_content,'This is my text on my_file1');

            file_content = dataFileHolder.get('my_file1_clone');
            tLog('2>',file_content);
            assert.equal(_.isString(file_content),true);
            assert.equal(file_content,'This is my text on my_file1');
        });
    });
});
