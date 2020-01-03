const basePath = process.env.ABSOLUTE_APP_PATH
const path = require('path')
const os = require('os')
const { ConfigFile } = require('./configFile.class')

const Config = new ConfigFile(path.join(basePath, 'config.json'))
const PlatformString = `${os.platform()}-${os.release()}`

Config.addField({
  name: 'Platform',
  schema: {
    type: 'string',
    readOnly: true
  },
  value: PlatformString,
  description: 'Name and version of the current platform in order to avoid to reuse the config file on the wrong system'
})

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
  value: 'samples_index',
  description: 'Index generated after a full samples directory scan'
})

Config.addField({
  name: 'ProjectHistoryFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'project_history',
  description: 'List of opened projects, current one, etc.'
})

Config.addField({
  name: 'BookmarkFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'bookmarks',
  description: 'List of bookmarked samples'
})

Config.addField({
  name: 'PathQueryFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'path_queries',
  description: 'File with queries for sample paths'
})

Config.addField({
  name: 'SamplesDirectory',
  schema: {
    type: 'absDirPath',
    checkExists: true
  },
  value: basePath,
  description: 'Directory with samples to scan and search in'
})

Config.addField({
  name: 'SamplesDirectoryExclusions',
  schema: {
    type: 'array',
    items: {
      type: 'relDirPath',
      basePath: Config.get('SamplesDirectory')
    },
    default: [
      'samplePack1',
      'samplePack2'
    ]
  },
  description: 'Directories (paths) which must be skipped during the scan process of samples directory; these paths are relative to SamplesDirectory path'
})

Config.addField({
  name: 'RandomCount',
  schema: {
    type: 'number',
    positive: true,
    integer: true
  },
  value: 15,
  description: 'Maximum number of random samples selected after a search'
})

Config.addField({
  name: 'MaxSamplesSameDirectory',
  schema: {
    type: 'number',
    positive: true,
    integer: true
  },
  value: 2,
  description: 'Maximum number of samples from the same directory, to avoid too many samples from the same family'
})

Config.addField({
  name: 'ExcludedExtensionsForSamples',
  schema: {
    type: 'array',
    items: 'string',
    default: ['exe', 'DS_Store', 'info']
  },
  description: 'The list of extensions which the samples must NOT have'
})

Config.addField({
  name: 'IncludedExtensionsForSamples',
  schema: {
    type: 'array',
    items: 'string',
    default: ['wav', 'mp3']
  },
  description: 'The list of extensions which the samples must have'
})

Config.addField({
  name: 'ExtensionsPolicyForSamples',
  schema: {
    type: 'enum',
    values: ['X', 'I', 'E']
  },
  value: 'X',
  description: 'I to get files with declared extensions only, E to exclude file with some extensions, and X to disable the extension filter'
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
  },
  description: 'Application status data, flags, etc.'
})

Config.load()

if (Config.get('Platform') !== PlatformString) {
  Config.deleteFile()
  Config.load()
}

Config.getField('SamplesDirectory').on('change', ({ newValue }) => {
  Config.getField('Status').add('new-scan-needed', true)
  Config.getField('SamplesDirectoryExclusions').changeSchema({
    items: {
      basePath: newValue
    }
  })
})

Config.getField('SamplesDirectoryExclusions').on('change', () => {
  Config.getField('Status').add('new-scan-needed', true)
})

Config.getField('ExtensionsPolicyForSamples').on('change', () => {
  Config.getField('Status').add('new-scan-needed', true)
})

Config.getField('ExcludedExtensionsForSamples').on('change', () => {
  if (Config.get('ExtensionsPolicyForSamples') === 'E') {
    Config.getField('Status').add('new-scan-needed', true)
  }
})

Config.getField('IncludedExtensionsForSamples').on('change', () => {
  if (Config.get('ExtensionsPolicyForSamples') === 'I') {
    Config.getField('Status').add('new-scan-needed', true)
  }
})

Config.save()

module.exports = {
  Config
}
