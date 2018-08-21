const test_config = require('../require.js');

describe('DirectoryTree.class', function() {
    describe('#walk()', function() {
        it("traverses the directory tree, showing more info", function() {
            let tt = new DirectoryTree(test_config.SamplesDirectory);
            tt.read();
            assert.equal(tt.error(),false);
            tt.walk({
                itemCb:(data)=>{
                    tLog(_.padStart(' ',(data.level+1)*3),'',data.level, data.is_first_child, data.is_last_child, "'"+data.item.rel_path+"'",data.item.sizeString);
                    tLog(_.padStart(' ',(data.level+1)*3),' > Parent:',data.parent.path,"\n");
                }
            });
            tLog('DirectoryTree files: '+tt.fileCount());
            tLog('DirectoryTree directories: '+tt.directoryCount());
            tLog('DirectoryTree nodes: '+tt.nodeCount());
        });
    });
    describe('#walk()', function() {
        it("traverses the directory tree, with wrong address", function() {
            let tt = new DirectoryTree(test_config.SamplesDirectory+'_not_exists');
            tt.read();
            assert.equal(tt.error(),true);
            tLog('DirectoryTree files: '+tt.fileCount());
            tLog('DirectoryTree directories: '+tt.directoryCount());
            tLog('DirectoryTree nodes: '+tt.nodeCount());
        });
    });
});