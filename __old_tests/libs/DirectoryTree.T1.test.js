const test_config = require('../require.js');

describe('DirectoryTree.class - TEST the static methods of DirectoryTree', function() {
    describe('#walkDirectory() - static method', function() {
        it("show the node's path informations", function() {
            DirectoryTree.walkDirectory(ConfigMgr.path('samples_directory'),{
                itemCb:(data)=>{
                    // callback for each item
                    //if(item.isDirectory===true) console.log('\t\t',item.rel_path,'\t',item.name,item.size);
                    if(data.item.isFile===true)      tLog('F : ',data.item.rel_path,'[' +data.item.name+' '+data.item.sizeString+' ]');
                    if(data.item.isDirectory===true) tLog('D : ',data.item.rel_path,'[' +data.item.name+' '+data.item.sizeString+' ]');
                },
                afterDirectoryCb:(item)=>{
                    tLog('  > ',item.rel_path,'[' +item.name+' '+item.sizeString+' ]');
                }
            });
        });
    });
});