const test_config = require('../require.js');
let UF = Utils.File;

describe('DataManager.class - Tests for an holder of file-object', function() {
    describe("#setHolder('scan_index')", function() {
        it("set an holder of file-object", function() {
            DataMgr.setHolder({
                label:'scan_index',
                filePath:ConfigMgr.path('samples_index'),
                fileType:'json',
                checkFn:(dataObj,args)=>{
                    return (dataObj && !dataObj.error());
                },
                getFn:(dataObj,$cfg,args)=>{
                    return dataObj;
                },
                setFn:($cfg,args)=>{
                    let tt = new DirectoryTree(ConfigMgr.path('samples_directory'));
                    tt.read();
                    if(!tt.error()) {
                        return tt;
                    }
                    return null;
                },
                loadFn:(fileData,$cfg,args)=>{
                    if(!_.isObject(fileData)) return null;
                    let tt = new DirectoryTree(ConfigMgr.path('samples_directory'));
                    tt.fromJson(fileData);
                    if(!tt.error()) return tt;
                },
                saveFn:(dataObj,$cfg,args)=>{
                    if(!$cfg.checkFn(dataObj)) return;
                    return dataObj.toJson();
                }
            });
            assert.equal(DataMgr.hasData('scan_index'),false);
            assert.equal(DataMgr.hasHolder('scan_index'),true);
        });
    });

    describe("#setHolder('scan_index_reference')", function() {
        it("set an holder of file-object", function() {
            DataMgr.setHolder({
                label:'scan_index_reference',
                filePath:ConfigMgr.path('samples_index')+'_ref.json',
                fileType:'json',
                checkFn:(dataObj,args)=>{
                    return (dataObj && !dataObj.error());
                },
                getFn:(dataObj,$cfg,args)=>{
                    return dataObj;
                },
                setFn:($cfg,args)=>{
                    let tt = new DirectoryTree(ConfigMgr.path('samples_directory'));
                    tt.read();
                    if(!tt.error()) {
                        return tt;
                    }
                    return null;
                },
                loadFn:(fileData,$cfg,args)=>{
                    if(!_.isObject(fileData)) return null;
                    let tt = new DirectoryTree(ConfigMgr.path('samples_directory'));
                    tt.fromJson(fileData);
                    if(!tt.error()) return tt;
                },
                saveFn:(dataObj,$cfg,args)=>{
                    if(!$cfg.checkFn(dataObj)) return;
                    return dataObj.toJson();
                }
            });
            assert.equal(DataMgr.hasData('scan_index_reference'),false);
            assert.equal(DataMgr.hasHolder('scan_index_reference'),true);
        });
    });

    describe("#checkContainer('scan_index')", function() {
        it("check the holder of file-object", function() {
            assert.equal(DataMgr.hasData('scan_index'),false);
            assert.equal(DataMgr.hasHolder('scan_index'),true);
        });
    });

    describe("#checkContainer('scan_index_reference')", function() {
        it("check the holder of file-object", function() {
            assert.equal(DataMgr.hasData('scan_index_reference'),false);
            assert.equal(DataMgr.hasHolder('scan_index_reference'),true);
        });
    });

    describe("#get('scan_index')", function() {
        it("get the data of the holder of file-object;\n\t should not find data and should not call loadFn and setFn", function() {
            assert.equal(DataMgr.get('scan_index'),null);
        });
    });

    describe("#get('scan_index_reference')", function() {
        it("get the data of the holder of file-object;\n\t should not find data and should not call loadFn and setFn", function() {
            assert.equal(DataMgr.get('scan_index_reference'),null);
        });
    });

    describe("#save('scan_index')", function() {
        it("save the data of the holder of file-object - should not find data and should not call saveFn", function() {
            assert.equal(DataMgr.save('scan_index'),null);
        });
    });

    describe("#load('scan_index')", function() {
        it("should call loadFn but the file does not exist", function() {
            UF._FS_EXTRA.removeSync(ConfigMgr.path('samples_index'));
            assert.equal(DataMgr.load('scan_index'),null);
        });
    });

    describe("#set('scan_index')", function() {
        it("should call setFn", function() {
            UF._FS_EXTRA.removeSync(ConfigMgr.path('samples_index'));
            let samples_tt = DataMgr.set('scan_index');
            assert.notEqual(samples_tt,null);
            assert.notEqual(samples_tt,undefined);
            assert.equal(samples_tt.nodeCount()>0,true);
            assert.equal(samples_tt.fileCount()>0,true);
            assert.equal(samples_tt.directoryCount()>0,true);
            samples_tt.print();
        });
    });

    describe("#set('scan_index_reference')", function() {
        it("should call setFn", function() {
            let samples_tt = DataMgr.set('scan_index_reference');
            assert.notEqual(samples_tt,null);
            assert.notEqual(samples_tt,undefined);
            assert.equal(samples_tt.nodeCount()>0,true);
            assert.equal(samples_tt.fileCount()>0,true);
            assert.equal(samples_tt.directoryCount()>0,true);
            samples_tt.print();
        });
    });

    describe("#save('scan_index')", function() {
        it("should call saveFn", function() {
            assert.notEqual(DataMgr.save('scan_index'),null);
        });
    });

    describe("#load('scan_index')", function() {
        it("should call loadFn", function() {
            let samples_tt = DataMgr.load('scan_index');
            samples_tt.print();
        });
    });

    describe("#save('scan_index_reference')", function() {
        it("should call saveFn", function() {
            assert.equal(_.isObject(DataMgr.$cfg('scan_index_reference')),true);
            UF._FS_EXTRA.removeSync(DataMgr.$cfg('scan_index_reference').filePath);
            assert.notEqual(DataMgr.save('scan_index_reference'),null);
        });
    });

    describe("#compare 2 DirectoryTree", function() {
        it("should call getFn 2 times and compare 2 directory tree", function() {
            let samples_tt = DataMgr.get('scan_index');
            let samples_tt_ref = DataMgr.get('scan_index_reference');
            assert.notEqual(samples_tt,null);
            assert.notEqual(samples_tt_ref,null);
            assert.equal(samples_tt.isEqualTo(samples_tt_ref),true);
        });
    });

    describe("#setHolder('scan_index2')", function() {
        it("set an holder of file-object and performs save with json-compact", function() {
            DataMgr.setHolder({
                label:'scan_index2',
                filePath:ConfigMgr.path('samples_index')+'_2.json',
                fileType:'json-compact',
                checkFn:(dataObj,args)=>{
                    return (dataObj && !dataObj.error());
                },
                getFn:(dataObj,$cfg,args)=>{
                    return dataObj;
                },
                setFn:($cfg,args)=>{
                    let tt = new DirectoryTree(ConfigMgr.path('samples_directory'));
                    tt.read();
                    if(!tt.error()) {
                        return tt;
                    }
                    return null;
                },
                loadFn:(fileData,$cfg,args)=>{
                    if(!_.isObject(fileData)) return null;
                    let tt = new DirectoryTree(ConfigMgr.path('samples_directory'));
                    tt.fromJson(fileData);
                    if(!tt.error()) return tt;
                },
                saveFn:(dataObj,$cfg,args)=>{
                    if(!$cfg.checkFn(dataObj)) return;
                    return dataObj.toJson();
                }
            });
            assert.equal(DataMgr.hasData('scan_index2'),false);
            assert.equal(DataMgr.hasHolder('scan_index2'),true);
            let samples_tt = DataMgr.set('scan_index2');
            assert.notEqual(samples_tt,null);
            assert.notEqual(samples_tt,undefined);
            assert.equal(samples_tt.nodeCount()>0,true);
            assert.equal(samples_tt.fileCount()>0,true);
            assert.equal(samples_tt.directoryCount()>0,true);
            assert.notEqual(DataMgr.save('scan_index2'),null);
        });
    });
});
