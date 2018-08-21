const test_config = require('../require.js');

describe('DataManager.class', function() {
    describe('#setRelationship()', function() {
        it("set a relation between file and object", function() {
            DataMgr.setRelationship({
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
            assert.equal(DataMgr.hasRelationship('scan_index'),true);

            // DM.get('scan_index');
            // DM.set('scan_index');
            // DM.set('scan_index',obj);
        });
    });
});