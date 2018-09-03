const test_config = require('../require.js');
let UF = Utils.File;

describe('DataManager.class - Tests for an holder of file-object', function() {
    describe("#setHolder('samples_index')", function() {
        it("set an holder of file-object", function() {
            UF._FS_EXTRA.removeSync(ConfigMgr.path('samples_index'));

            let options = {
                directoryToScan: ConfigMgr.path('samples_directory')
            };

            let __new_SamplesTree = function(){
                let STree = new SamplesTree(options.directoryToScan,{
                    /* SampleTree options */
                },{
                    /* DirectoryTree options */
                    excludedExtensions:ConfigMgr.get('ExtensionExcludedForSamples')
                });
                return STree;
            }

            let setHolderOutcome = DataMgr.setHolder({
                label:'samples_index_test',
                filePath:ConfigMgr.path('samples_index'),
                fileType:'json',
                dataType:'object',
                logErrorsFn:console.log,
                //preLoad:true,

                checkFn:(STree,args)=>{
                    return (STree && STree.T && !STree.T.error());
                },

                getFn:(STree, $cfg, args)=>{
                    return STree;
                },

                printFn:(STree, $cfg, args)=>{
                    if(!$cfg.checkFn(STree)) return;
                    STree.T.walk({
                        itemCb:(data)=>{
                            console.log(_.padStart(' ',(data.item.level+1)*3),data.item.rel_path,'('+data.item.sizeString+')');
                        }
                    });
                },

                setFn:($cfg,args)=>{
                    let STree = __new_SamplesTree();
                    STree.T.read();
                    if(!$cfg.checkFn(STree)) return;
                    return STree;
                },

                loadFn:(fileData, $cfg, args)=>{
                    if(!_.isObject(fileData)) return null;
                    let STree = __new_SamplesTree();
                    STree.T.fromJson(fileData);
                    if(!$cfg.checkFn(STree)) return;
                    return STree;
                },

                saveFn:(STree, $cfg, args)=>{
                    if(!$cfg.checkFn(STree)) return;
                    return STree.T.toJson();
                }
            });
            //tLog("\nsamples_directory:\n",ConfigMgr.path('samples_directory'));
            //tLog("\n$cfg:\n",DataMgr.$cfg('samples_index_test'));
            assert.equal(setHolderOutcome,true);
            assert.equal(DataMgr.hasHolder('samples_index_test'),true);
        });

        it("should have data", function() {
            assert.equal(DataMgr.hasData('samples_index_test'),false);
        });

        it("loads and check data", function() {
            assert.equal(DataMgr.load('samples_index_test'),false);
            assert.notEqual(DataMgr.hasData('samples_index_test'),true);
            //DataMgr.print('samples_index_test');
        });

        it("sets and check data", function() {
            assert.notEqual(DataMgr.set('samples_index_test'),null);
            assert.equal(DataMgr.hasData('samples_index_test'),true);
            //DataMgr.print('samples_index_test');
        });

        it("save data", function() {
            let save_outcome = DataMgr.save('samples_index_test');
            assert.notEqual(save_outcome,null);
            assert.notEqual(save_outcome,false);
            assert.equal(UF.fileExistsSync(ConfigMgr.path('samples_index')),true);
        });

        it("loads and check data", function() {
            let load_outcome = DataMgr.save('samples_index_test');
            assert.notEqual(load_outcome,null);
            assert.notEqual(load_outcome,false);
            assert.equal(DataMgr.hasData('samples_index_test'),true);
            //DataMgr.print('samples_index_test');
        });

        it("get data and calls a simple method", function() {
            let ST = DataMgr.get('samples_index_test');
            assert.equal(_.isObject(ST),true);
            //ST.T.print();
        });

    });
});
