//ConfigMgr

(function(){

    ConfigMgr.addField('SamplesDirectory', {
        datatype: 'abspath',
        defaultValue: '',
        checkPathExists: true
    });

    ConfigMgr.addField('ExportDirectory', {
        datatype: 'abspath',
        defaultValue: ''
    });

    ConfigMgr.addField('ProjectsDirectory', {
        datatype: 'abspath',
        defaultValue: '',
        checkPathExists: true
    });

    ConfigMgr.addField('DAW', {
        datatype: 'string',
        defaultValue: 'Ableton',
        allowedValues: ['Ableton','Cubase']
    });

    ConfigMgr.addField('RandomCount', {
        datatype: 'integer',
        defaultValue: 11
    });

    ConfigMgr.addField('MaxOccurrencesSameDirectory', {
        datatype: 'integer',
        defaultValue: 1
    });

    ConfigMgr.addField('ExtensionCheckForSamples', {
        datatype: 'char',
        defaultValue: 'X',
        allowedValues: ['X','E','I']
    });

    ConfigMgr.addField('IncludedExtensionsForSamples', {
        datatype: 'array',
        objectDatatype: 'string',
        defaultValue: [
            ".xml",
            ".log",
            "essentialsound",
            "olp"
        ]
    });

    ConfigMgr.addField('ExcludedExtensionsForSamples', {
        datatype: 'array',
        objectDatatype: 'string',
        defaultValue: [
            "asd",
            "DS_Store",
            "cfg",
            "txt",
            "exe"
        ]
    });

})();



ConfigMgr.print();

/*

ConfigMgr.addField('fieldlabel', {
    datatype: 'string',
    objectDatatype: 'string',
    defaultValue: 'abc'
});




*/

// ConfigMgr.get('param');
// ConfigMgr.set('param',value);


//ConfigMgr.setUserDirectory('userdata' /*dir name*/);

//ConfigMgr.addUserFile('myfile.json');
//ConfigMgr.addUserDirectory('/newdir');
//ConfigMgr.addUserFile('/newdir/myfile.json');

// ConfigMgr.upath  //user path
// ConfigMgr.path   //app path


//ConfigMgr.addFlag('abc123','My text abc 123');
//ConfigMgr.setFlag('abc123');
//ConfigMgr.unsetFlag('abc123');

//ConfigMgr.firstStart(); //fn at first start > no need of configmgr...just type the code here

//ConfigMgr.save();
