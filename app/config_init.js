(function () {
  configMgr.addField('SamplesDirectory', {
    description: '',
    datatype: 'absdirpath',
    defaultValue: '',
    checkPathExists: true,
    flagsOnChange: ['samples_index_first_scan_needed']
  })

  configMgr.addField('ExportDirectory', {
    description: '',
    datatype: 'absdirpath',
    defaultValue: ''
  })

  configMgr.addField('ProjectsDirectory', {
    description: '',
    datatype: 'absdirpath',
    defaultValue: '',
    checkPathExists: true
  })

  configMgr.addField('DAW', {
    description: '',
    datatype: 'string',
    defaultValue: 'Ableton',
    allowedValues: ['Ableton', 'Cubase']
  })

  configMgr.addField('RandomCount', {
    description: '',
    datatype: 'integer',
    defaultValue: 11
  })

  configMgr.addField('MaxOccurrencesSameDirectory', {
    description: '',
    datatype: 'integer',
    defaultValue: 1
  })

  configMgr.addField('ExtensionCheckForSamples', {
    datatype: 'char',
    defaultValue: 'X',
    allowedValues: ['X', 'E', 'I'],
    flagsOnChange: ['samples_index_new_scan_needed']
  })

  configMgr.addField('IncludedExtensionsForSamples', {
    description: '',
    datatype: 'array',
    objectDatatype: 'string',
    defaultValue: [
      '.xml',
      '.log',
      'essentialsound',
      'olp'
    ],
    flagsOnChange: ['samples_index_new_scan_needed']
  })

  configMgr.addField('ExcludedExtensionsForSamples', {
    description: '',
    datatype: 'array',
    objectDatatype: 'string',
    defaultValue: [
      'asd',
      'DS_Store',
      'cfg',
      'txt',
      'exe'
    ],
    flagsOnChange: ['samples_index_new_scan_needed']
  })

  configMgr.addFlag('samples_index_first_scan_needed', 'First scan needed in the samples directory')
  configMgr.addFlag('samples_index_new_scan_needed', 'New scan needed after changing the configuration on file libs')

  configMgr.setUserdataDirectory('userdata')
  configMgr.setConfigFile('config.json')

  configMgr.addUserDirectory('default_projects', 'default_projects')
  configMgr.addUserFile('bookmarks', 'bookmarks.json')
  configMgr.addUserFile('projects', 'projects.json')
  configMgr.addUserFile('tquery', 'tqueries.json')
  configMgr.addUserFile('samples_index', 'samples_index')

  configMgr.init()
})()

// console.log(configMgr.get('MaxOccurrencesSameDirectory'));
// console.log(configMgr.set('MaxOccurrencesSameDirectory',3));
// console.log(configMgr.set('MaxOccurrencesSameDirectory',true));
// console.log(configMgr.get('MaxOccurrencesSameDirectory'));
//
// console.log();
//
// console.log(configMgr.get('ExtensionCheckForSamples'));
// console.log(configMgr.set('ExtensionCheckForSamples',true));
// console.log(configMgr.set('ExtensionCheckForSamples','Fd'));
// console.log(configMgr.set('ExtensionCheckForSamples','R'));
// //console.log(configMgr.set('ExtensionCheckForSamples','E'));
// //console.log(configMgr.set('ExtensionCheckForSamples',3));
// console.log(configMgr.get('ExtensionCheckForSamples'));

// console.log(configMgr.set('SamplesDirectory','/Users'));

// configMgr.print();
// configMgr.printInternals();

// configMgr.get('param');
// configMgr.set('param',value);

// configMgr.setUserDirectory('userdata' /*dir name*/);

// configMgr.addUserFile('myfile.json');
// configMgr.addUserDirectory('/newdir');
// configMgr.addUserFile('/newdir/myfile.json');

// configMgr.upath  //user path
// configMgr.path   //app path

// configMgr.setFlag('abc123');
// configMgr.unsetFlag('abc123');

// configMgr.firstStart(); //fn at first start > no need of configMgr...just type the code here

// configMgr.save();
