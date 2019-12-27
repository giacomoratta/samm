const test_config = require('../require.js');

describe('directoryTree.class - TEST the traversing of a directoryTree', function() {
    describe('#walk()', function() {
        it("traverses the directory tree, showing more info", function() {
            let tt = new directoryTree(configMgr.path('samples_directory'));
            tt.read();
            assert.equal(tt.error(),false);
            tt.walk({
                itemFn:(data)=>{
                    assert.equal(_.isInteger(data.item.level),true);
                    assert.equal(_.isString(data.item.rel_root),true);
                    assert.equal(_.isString(data.item.rel_path),true);
                    assert.equal(_.isBoolean(data.isFirstChild),true);
                    assert.equal(_.isBoolean(data.isLastChild),true);
                    assert.equal(_.isObject(data.parent),true);
                    tLog(_.padStart(' ',(data.item.level+1)*3),'',data.item.level, data.isFirstChild, data.isLastChild, "'"+data.item.rel_path+"'",data.item.sizeString);
                    tLog(_.padStart(' ',(data.item.level+1)*3),' > Parent:',data.parent.path,"\n");
                }
            });
            tLog('directoryTree root path: '+tt.rootPath());
            tLog('directoryTree files: '+tt.fileCount());
            tLog('directoryTree directories: '+tt.directoryCount());
            tLog('directoryTree nodes: '+tt.nodeCount());
        });
    });
    describe('#walk()', function() {
        it("traverses the directory tree, with wrong address", function() {
            let tt = new directoryTree(configMgr.path('samples_directory')+'_not_exists');
            tt.read();
            assert.equal(tt.error(),true);
            tLog('directoryTree root path: '+tt.rootPath());
            tLog('directoryTree files: '+tt.fileCount());
            tLog('directoryTree directories: '+tt.directoryCount());
            tLog('directoryTree nodes: '+tt.nodeCount());
        });
    });
});
