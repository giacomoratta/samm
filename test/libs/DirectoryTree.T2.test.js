const test_config = require('../require.js');

describe('DirectoryTree.class - TEST the traversing of a DirectoryTree', function() {
    describe('#walk()', function() {
        it("traverses the directory tree, showing more info", function() {
            let tt = new DirectoryTree(ConfigMgr.path('samples_directory'));
            tt.read();
            assert.equal(tt.error(),false);
            tt.walk({
                itemCb:(data)=>{
                    tLog(_.padStart(' ',(data.level+1)*3),'',data.level, data.is_first_child, data.is_last_child, "'"+data.item.rel_path+"'",data.item.sizeString);
                    tLog(_.padStart(' ',(data.level+1)*3),' > Parent:',data.parent.path,"\n");
                }
            });
            tLog('DirectoryTree root path: '+tt.rootPath());
            tLog('DirectoryTree files: '+tt.fileCount());
            tLog('DirectoryTree directories: '+tt.directoryCount());
            tLog('DirectoryTree nodes: '+tt.nodeCount());
        });
    });
    describe('#walk()', function() {
        it("traverses the directory tree, with wrong address", function() {
            let tt = new DirectoryTree(ConfigMgr.path('samples_directory')+'_not_exists');
            tt.read();
            assert.equal(tt.error(),true);
            tLog('DirectoryTree root path: '+tt.rootPath());
            tLog('DirectoryTree files: '+tt.fileCount());
            tLog('DirectoryTree directories: '+tt.directoryCount());
            tLog('DirectoryTree nodes: '+tt.nodeCount());
        });
    });
});