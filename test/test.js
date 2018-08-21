require('./require.js');

describe('libs', () => {
    require('./libs/DirectoryTree.T1.test.js');
    require('./libs/DirectoryTree.T2.test.js');
    require('./libs/DataManager.T1.test');
});

describe('modules', () => {
    //require('./modules/testB.js');
});

describe('configuration', function() {
    describe('printInternals', function() {
        it("show the current configuration", function() {
            console.log('\n\nLoaded config\n',ConfigMgr._config,'\n');
            ConfigMgr.printInternals();
        });
    });
});
