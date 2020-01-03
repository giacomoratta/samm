const basePath = process.env.ABSOLUTE_APP_PATH
const path = require('path')
const { ConfigFile } = require('./config')

const Config = new ConfigFile(path.join(basePath, 'config.json'))

Config.addField({
  name: 'UserdataDirectory',
  schema: {
    type: 'relDirPath',
    basePath: basePath,
    createIfNotExists: true,
    readOnly: true
  },
  value: 'userdata',
  description: 'Directory for storing all the user data'
})

Config.addField({
  name: 'SampleIndexFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'samples_index'
})

Config.addField({
  name: 'ProjectHistoryFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'project_history'
})

Config.addField({
  name: 'BookmarkFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'bookmarks'
})

Config.addField({
  name: 'QueryFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'queries'
})

Config.addField({
  name: 'SamplesDirectory',
  schema: {
    type: 'absDirPath',
    checkExists: true
  },
  value: basePath,
  description: 'safasfassfa'
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
    default: ['exe', 'DS_Store', 'info']
  }
})

Config.addField({
  name: 'IncludedExtensionsForSamples',
  schema: {
    type: 'array',
    items: 'string',
    default: ['wav', 'mp3']
  }
})

Config.addField({
  name: 'ExtensionsPolicy',
  schema: {
    type: 'enum',
    values: ['X', 'I', 'E']
  },
  value: 'X'
})

Config.addField({
  name: 'Status',
  schema: {
    type: 'object',
    props: {
      'first-scan-needed': { type: 'boolean' },
      'new-scan-needed': { type: 'boolean' }
    }
  },
  value: {
    'first-scan-needed': true,
    'new-scan-needed': true
  }
})

Config.load()

Config.getField('SamplesDirectory').on('change', () => {
  Config.getField('Status').add('new-scan-needed', false)
})

Config.getField('ExcludedExtensionsForSamples').on('change', () => {
  Config.getField('Status').add('new-scan-needed', false)
})

Config.save()

module.exports = {
  Config
}
