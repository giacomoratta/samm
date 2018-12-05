//ConfigMgr

ConfigMgr.addField('fieldlabel', {});

// ConfigMgr.get('param');
// ConfigMgr.set('param',value);


ConfigMgr.setUserDirectory('userdata' /*dir name*/);

ConfigMgr.addUserFile('myfile.json');
ConfigMgr.addUserDirectory('/newdir');
ConfigMgr.addUserFile('/newdir/myfile.json');

// ConfigMgr.upath  //user path
// ConfigMgr.path   //app path


ConfigMgr.addFlag('abc123','My text abc 123');
ConfigMgr.setFlag('abc123');
ConfigMgr.unsetFlag('abc123');

//ConfigMgr.firstStart(); //fn at first start > no need of configmgr...just type the code here

ConfigMgr.save();
