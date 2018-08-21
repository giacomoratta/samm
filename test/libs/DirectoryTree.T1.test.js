const test_config = require('../require.js');

describe('DirectoryTree.class', function() {
    describe('#walkDirectory() - static method', function() {
        it("show the node's path informations", function() {
            DirectoryTree.walkDirectory(test_config.SamplesDirectory,{
                itemCb:(item)=>{
                    // callback for each item
                    //if(item.isDirectory===true) console.log('\t\t',item.rel_path,'\t',item.name,item.size);
                    if(item.isFile===true)      tLog('F : ',item.rel_path,'[' +item.name+' '+item.sizeString+' ]');
                    if(item.isDirectory===true) tLog('D : ',item.rel_path,'[' +item.name+' '+item.sizeString+' ]');
                },
                afterDirectoryCb:(item)=>{
                    tLog('  > ',item.rel_path,'[' +item.name+' '+item.sizeString+' ]');
                }
            });
        });
    });
});