//ConfigMgr

ConfigMgr.addField('fieldlabel', {
    type:'integer', //abspath, relpath, number, boolean, string, array, char
    arraytype:'string', //ENUM!!!
    value:'',
    checkExists: true, //only for path
    exitOnError: false,
    checkFn:null,
    onChangeFn:null, //setFlag, printMessages
    onUnchangeFn:null,
});

// ConfigMgr.get('param');
// ConfigMgr.set('param',value);


ConfigMgr.addUserData('userdata' /*dir name*/);

ConfigMgr.addUserDataFile('myfile.json');
ConfigMgr.addUserDataDirectory('/newdir');
ConfigMgr.addUserDataFile('/newdir/myfile.json');

// ConfigMgr.upath  //user path
// ConfigMgr.path   //app path


ConfigMgr.addFlag('abc123','My text abc 123');
ConfigMgr.setFlag('abc123');
ConfigMgr.unsetFlag('abc123');

//ConfigMgr.firstStart(); //fn at first start > no need of configmgr...just type the code here

ConfigMgr.save(); //flag inside ready=false to run first time settings
