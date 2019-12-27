/*
* set flags from outside
* set flags (in 'on' method of a field)
* check flags
* print flags
*
* */

const path = require('path')
const { JsonizedFile } = require('../core/jsonized-file')
const basePath = process.env.ABSOLUTE_APP_PATH || path.join(__dirname, '__tests__')

class ConfigFile extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true })
  }

  printStatusMessages() {

  }
}

const Config = new ConfigFile(path.join(basePath, 'config.json'))

Config.addField({
  name: 'SamplesDirectory',
  schema: {
    type: 'absDirPath',
    checkExists: true
  },
  value: basePath
})

Config.addField({
  name: 'CurrentProject',
  schema: {
    type: 'absDirPath',
    checkExists: true
  },
  value: basePath
})

Config.addField({
  name: 'RandomCount',
  schema: {
    type: 'number',
    positive: true,
    integer: true
  },
  value: 15
})

Config.addField({
  name: 'MaxOccurrencesSameDirectory',
  schema: {
    type: 'number',
    positive: true,
    integer: true
  },
  value: 2
})

Config.addField({
  name: 'ExcludedExtensionsForSamples',
  schema: {
    type: 'array',
    items: 'string',
    default: ['exe','DS_Store','info']
  }
})

Config.addField({
  name: 'IncludedExtensionsForSamples',
  schema: {
    type: 'array',
    items: 'string',
    default: ['wav','mp3']
  }
})

Config.addField({
  name: 'ExtensionsPolicy',
  schema: {
    type: 'enum',
    values: [ 'X', 'I', 'E' ]
  },
  value: 'X'
})

Config.addField({
  name: 'Tags',
  schema: {
    type: 'object',
    props: { },
    default: {
      kick: 'techno,kick,deep,sub',
      impact: 'impact,boom,shot,crash,bomb,808,efx',
      hihat: 'hihat,hi-hat,hh,top',
      abstract: 'abstract,complex'
    }
  }
})

Config.addField({
  name: 'ProjectHistory',
  schema: {
    type: 'array',
    items: 'string',
    default: ['']
  }
})

Config.addField({
  name: 'Status',
  schema: {
    type: 'object',
    props: {
      'first-scan-needed': { type: 'boolean' },
      'new-scan-needed': { type: 'boolean' },
    }
  },
  value: {
    'first-scan-needed': true,
    'new-scan-needed': true
  }
})

Config.load()

Config.getField('SamplesDirectory').on('change',() => {
  Config.getField('Status').add('new-scan-needed',false)
})

Config.getField('ExcludedExtensionsForSamples').on('change',() => {
  Config.getField('Status').add('new-scan-needed',false)
})

Config.save()

// todo
// configMgr.setUserdataDirectory('userdata')
// configMgr.setConfigFile('config.json')
// configMgr.addUserDirectory('default_projects', 'default_projects')
// configMgr.addUserFile('bookmarks', 'bookmarks.json')
// configMgr.addUserFile('projects', 'projects.json')
// configMgr.addUserFile('tquery', 'tqueries.json')
// configMgr.addUserFile('samples_index', 'samples_index')

module.exports = {
  Config
}
