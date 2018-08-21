const test_config = require('../require.js');

describe('DataManager.class', function() {
    describe("#setHolder('scan_index')", function() {
        it("set an holder for file and object", function() {
            DataMgr.setHolder({
                label:'scan_index',
                filePath:ConfigMgr.path('samples_index'),
                fileType:'json',
                checkFn:(dataObj,args)=>{
                    return (dataObj && !dataObj.error());
                },
                getFn:(dataObj,$cfg,args)=>{
                },
                setFn:($cfg,args)=>{
                    let tt = new DirectoryTree(test_config.SamplesDirectory);
                    tt.set();
                    if(!tt.error()) {
                        return tt;
                    }
                },
                loadFn:(fileData,$cfg,args)=>{
                    if(filedata){
                        let tt = new DirectoryTree(test_config.SamplesDirectory);
                        tt.fromJsonString(filedata);
                        if(!tt.error()) return tt;
                    }
                },
                saveFn:(dataObj,$cfg,args)=>{
                    if(!$cfg.checkFn(dataObj)) return;
                    return tt.toJsonString();
                }
            });
            assert.equal(DataMgr.hasData('scan_index'),false);
            assert.equal(DataMgr.hasHolder('scan_index'),true);
        });
    });

    describe("#checkContainer('scan_index')", function() {
        it("check the holder of file and object", function() {
            assert.equal(DataMgr.hasData('scan_index'),false);
            assert.equal(DataMgr.hasHolder('scan_index'),true);
        });
    });

    describe("#get('scan_index')", function() {
        it("get the data of the holder of file and object;\n\t should not find data and should not call loadFn and setFn", function() {
            assert.equal(DataMgr.get('scan_index'),null);
        });
    });

    describe("#save('scan_index')", function() {
        it("save the data of the holder of file and object - should not find data and should not call saveFn", function() {
            assert.equal(DataMgr.save('scan_index'),null);
        });
    });

    describe("#load('scan_index')", function() {
        it("should call loadFn", function() {
            DataMgr.load('scan_index')
            //assert.equal(DataMgr.save('scan_index'),null);
        });
    });
});
