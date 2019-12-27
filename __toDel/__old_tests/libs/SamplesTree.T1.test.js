const test_config = require('../require.js');
let UF = Utils.File;

describe('DataManager.class - Tests for an holder of file-object', function() {
    describe("#setHolder('samples_index')", function() {
        it("1. set an holder of file-object", function() {
            UF._FS_EXTRA.removeSync(configMgr.path('samples_index'));

            let options = {
                directoryToScan: configMgr.path('samples_directory')
            };

            let __new_SamplesTree = function(){
                let STree = new SamplesTree(options.directoryToScan,{
                    /* SampleTree options */
                },{
                    /* directoryTree options */
                    excludedExtensions:configMgr.get('ExcludedExtensionsForSamples')
                });
                return STree;
            }

            let setHolderOutcome = dataFileHolder.setHolder({
                label:'samples_index_test',
                filePath:configMgr.path('samples_index'),
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
                    STree.T.print();
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
            //tLog("\nsamples_directory:\n",configMgr.path('samples_directory'));
            //tLog("\n$cfg:\n",dataFileHolder.$cfg('samples_index_test'));
            assert.equal(setHolderOutcome,true);
            assert.equal(dataFileHolder.hasHolder('samples_index_test'),true);
        });

        it("2. should not have data", function() {
            assert.equal(dataFileHolder.hasData('samples_index_test'),false);
        });

        it("3 .try to load data from non-existent file", function() {
            assert.equal(dataFileHolder.load('samples_index_test'),false);
            assert.notEqual(dataFileHolder.hasData('samples_index_test'),true);
            //dataFileHolder.print('samples_index_test');
        });

        it("4 .sets and check data", function() {
            let smp_obj = dataFileHolder.set('samples_index_test');
            assert.notEqual(smp_obj,null);
            assert.equal(dataFileHolder.hasData('samples_index_test'),true);
            //dataFileHolder.print('samples_index_test');
        });

        it("5. save data", function() {
            let save_outcome = dataFileHolder.save('samples_index_test');
            assert.notEqual(save_outcome,null);
            assert.notEqual(save_outcome,false);
            assert.equal(UF.fileExistsSync(configMgr.path('samples_index')),true);
        });

        it("6. loads and check data", function() {
            let load_outcome = dataFileHolder.save('samples_index_test');
            assert.notEqual(load_outcome,null);
            assert.notEqual(load_outcome,false);
            assert.equal(dataFileHolder.hasData('samples_index_test'),true);
            //dataFileHolder.print('samples_index_test');
        });

        it("7. get data and calls a simple method", function() {
            let ST = dataFileHolder.get('samples_index_test');
            assert.equal(_.isObject(ST),true);
            tLog('Node Count: ',ST.T.nodeCount());
            tLog('File Count: ',ST.T.fileCount());
            tLog('Directory Count: ',ST.T.directoryCount());
            //ST.T.print();
        });
    });

    describe("Samples manipulation",function(){
        it("2. filter all samples with some queries", function() {
            let ST = dataFileHolder.get('samples_index_test');
            tLog(configMgr.get('ExcludedExtensionsForSamples'));
            //ST.T.print();
            let smp_obj1 = ST.filterByTags('ge');
            tLog("\n > smp_obj1\n",smp_obj1._array);
            assert.equal(smp_obj1.error(),false);

            let smp_obj2 = ST.filterByTags('la');
            tLog("\n > smp_obj2\n",smp_obj2._array);
            assert.equal(smp_obj2.error(),false);

            let smp_obj3 = ST.filterByTags('la+mu,ge+om');
            tLog("\n > smp_obj3\n",smp_obj3._array,"\n");
            tLog("smp_obj3 label: ",smp_obj3.getTagLabel());
            tLog("smp_obj3 short label: ",smp_obj3.getTagShortLabel());
            assert.equal(smp_obj3.error(),false);

            let smp_obj4 = ST.filterByTags('large+music,balanced,ge+room');
            tLog("smp_obj4 label: ",smp_obj4.getTagLabel());
            tLog("smp_obj4 short label: ",smp_obj4.getTagShortLabel());
            assert.equal(smp_obj4.error(),false);

            let smp_obj5 = ST.filterByTags();
            tLog("\n > smp_obj5\n",smp_obj5,"\n");
            assert.equal(smp_obj5.error(),false);
            assert.equal(smp_obj5.empty(),true);
        });

        it("3. filter random samples with some queries", function() {
            let ST = dataFileHolder.get('samples_index_test');

            let smp_obj2 = ST.filterByTags('la');
            //tLog("\n > smp_obj2\n",smp_obj2._array);
            smp_obj2.print();
            assert.equal(smp_obj2.error(),false);
            tLog(" > query tag: "+smp_obj2.getTagLabel());
            tLog(" > size: "+smp_obj2.size());

            let smp_rnd_obj2 = smp_obj2.getRandom(10,2);
            //tLog("\n > smp_rnd_obj2\n",smp_rnd_obj2._array);
            smp_rnd_obj2.print();
            assert.equal(smp_rnd_obj2.error(),false);
            tLog(" > query tag: "+smp_obj2.getTagLabel());
            tLog(" > size: "+smp_obj2.size());
        });
    })
});
