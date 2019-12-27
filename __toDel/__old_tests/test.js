require('./require.js');

describe('libs', () => {
    require('./libs/Utils.File.T1.test.js');
    require('./libs/Utils.File.T2.test.js');
    require('./libs/Utils.File.T3.test.js');
    require('./libs/directoryTree.T1.test.js');
    require('./libs/directoryTree.T2.test.js');
    require('./libs/DataManager.T1.test');
    require('./libs/DataManager.T2.test');
    require('./libs/DataManager.T3.test');
    require('./libs/SamplesTree.T1.test');
});

describe('modules', () => {
    //require('./modules/testB.js');
});

describe('configuration', function() {
    describe('printInternals', function() {
        it("show the current configuration", function() {
            console.log('\n\nLoaded config\n',configMgr._config,'\n');
            configMgr.printInternals();
        });
    });
});
