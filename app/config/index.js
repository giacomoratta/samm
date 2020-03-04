const path = require('path')
const os = require('os')
const { ConfigFile } = require('./configFile.class')
const log = require('../../core/logger').createLogger('config')

let ConfigInstance = null
let ConfigCleanDataPostponed = false
const PlatformSignature = `${os.platform()}-${os.release()}`

const __init__ = (filePath) => {
  const basePath = path.parse(filePath).dir
  ConfigInstance = new ConfigFile(filePath)

  ConfigInstance.addField({
    name: 'Platform',
    schema: {
      type: 'string',
      readOnly: true
    },
    value: PlatformSignature,
    description: 'Name and version of the current platform in order to avoid to reuse the config file on the wrong system'
  })

  // ConfigInstance.addField({
  //   name: 'UserdataDirectory',
  //   schema: {
  //     type: 'relDirPath',
  //     basePath: basePath,
  //     createIfNotExists: true,
  //     readOnly: true
  //   },
  //   value: 'userdata',
  //   description: 'Directory for storing all the user data'
  // })
  //
  // ConfigInstance.addField({
  //   name: 'SampleIndexFile',
  //   schema: {
  //     type: 'relFilePath',
  //     basePath: ConfigInstance.getField('UserdataDirectory').get(),
  //     createIfNotExists: true,
  //     readOnly: true
  //   },
  //   value: 'samples_index',
  //   description: 'Index generated after a full samples directory scan'
  // })
  //
  // ConfigInstance.addField({
  //   name: 'ProjectHistoryFile',
  //   schema: {
  //     type: 'relFilePath',
  //     basePath: ConfigInstance.getField('UserdataDirectory').get(),
  //     createIfNotExists: true,
  //     readOnly: true
  //   },
  //   value: 'project_history',
  //   description: 'List of opened projects, current one, etc.'
  // })
  //
  // ConfigInstance.addField({
  //   name: 'BookmarkFile',
  //   schema: {
  //     type: 'relFilePath',
  //     basePath: ConfigInstance.getField('UserdataDirectory').get(),
  //     createIfNotExists: true,
  //     readOnly: true
  //   },
  //   value: 'bookmarks',
  //   description: 'List of bookmarked samples'
  // })
  //
  // ConfigInstance.addField({
  //   name: 'PathQueryFile',
  //   schema: {
  //     type: 'relFilePath',
  //     basePath: ConfigInstance.getField('UserdataDirectory').get(),
  //     createIfNotExists: true,
  //     readOnly: true
  //   },
  //   value: 'path_queries',
  //   description: 'File with queries for sample paths'
  // })

  ConfigInstance.addField({
    name: 'SamplesDirectory',
    schema: {
      type: 'absDirPath',
      checkExists: true,
      default: basePath
    },
    description: 'Directory with samples to scan and search in'
  })

  ConfigInstance.addField({
    name: 'SamplesDirectoryExclusions',
    schema: {
      type: 'array',
      items: {
        type: 'relDirPath',
        basePath: ConfigInstance.get('SamplesDirectory') || basePath
      },
      default: [
        'samplePack1',
        'samplePack2'
      ]
    },
    description: 'Directories (paths) which must be skipped during the scan process of samples directory; these paths are relative to SamplesDirectory path'
  })

  ConfigInstance.addField({
    name: 'RandomCount',
    schema: {
      type: 'number',
      positive: true,
      integer: true
    },
    value: 15,
    description: 'Maximum number of random samples selected after a search'
  })

  ConfigInstance.addField({
    name: 'MaxSamplesSameDirectory',
    schema: {
      type: 'number',
      positive: true,
      integer: true
    },
    value: 2,
    description: 'Maximum number of samples from the same directory, to avoid too many samples from the same family'
  })

  ConfigInstance.addField({
    name: 'ExcludedExtensionsForSamples',
    schema: {
      type: 'array',
      items: 'string',
      default: ['exe', 'DS_Store', 'info']
    },
    description: 'The list of extensions which the samples must NOT have'
  })

  ConfigInstance.addField({
    name: 'IncludedExtensionsForSamples',
    schema: {
      type: 'array',
      items: 'string',
      default: ['wav', 'mp3']
    },
    description: 'The list of extensions which the samples must have'
  })

  ConfigInstance.addField({
    name: 'ExtensionsPolicyForSamples',
    schema: {
      type: 'enum',
      values: ['X', 'I', 'E']
    },
    value: 'X',
    description: '\'I\' to get files with declared extensions only, \'E\' to exclude file with some extensions, and \'X\' to disable the extension filter'
  })

  ConfigInstance.addField({
    name: 'Status',
    schema: {
      type: 'object',
      props: {
        'first-scan-needed': { type: 'boolean' },
        'new-scan-needed': { type: 'boolean' }
      }
    },
    value: {
      'first-scan-needed': false,
      'new-scan-needed': false
    },
    description: 'Application status data, flags, etc.'
  })

  ConfigInstance.getField('SamplesDirectory').on('change', ({ newValue }) => {
    ConfigInstance.getField('Status').add('new-scan-needed', true)
    ConfigInstance.getField('SamplesDirectoryExclusions').schema = {
      items: {
        basePath: newValue
      }
    }
  })

  ConfigInstance.getField('SamplesDirectoryExclusions').on('change', () => {
    ConfigInstance.getField('Status').add('new-scan-needed', true)
  })

  ConfigInstance.getField('ExtensionsPolicyForSamples').on('change', () => {
    ConfigInstance.getField('Status').add('new-scan-needed', true)
  })

  ConfigInstance.getField('ExcludedExtensionsForSamples').on('change', () => {
    if (ConfigInstance.get('ExtensionsPolicyForSamples') === 'E') {
      ConfigInstance.getField('Status').add('new-scan-needed', true)
    }
  })

  ConfigInstance.getField('IncludedExtensionsForSamples').on('change', () => {
    if (ConfigInstance.get('ExtensionsPolicyForSamples') === 'I') {
      ConfigInstance.getField('Status').add('new-scan-needed', true)
    }
  })
}

const ConfigCleanData = () => {
  if (ConfigInstance === null) {
    log.info('Clean data postponed')
    ConfigCleanDataPostponed = true
    return
  }
  log.info('Cleaning data...')
  ConfigInstance.deleteFile()
}

const ConfigBoot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  __init__(filePath)
  if (ConfigCleanDataPostponed === true) {
    ConfigCleanData()
    ConfigCleanDataPostponed = false
  }
  if (await ConfigInstance.load() === true) {
    await ConfigInstance.save()
    log.info('Loaded successfully')
    if (ConfigInstance.get('Platform') !== PlatformSignature) {
      log.info(`Different platform signature (current: ${PlatformSignature}). Resetting...`)
      return ConfigInstance.reset()
    }
    return true
  }
  log.info('Cannot load or save')
  return false
}

module.exports = {
  Config: {
    get (name) { return ConfigInstance.get(name) },
    set (name, value) { return ConfigInstance.set(name, value) },
    unset (name) { return ConfigInstance.unset(name) },
    isUnset (name) { return ConfigInstance.isUnset(name) },
    save () { return ConfigInstance.save() },
    getField (name) { return ConfigInstance.getField(name) },
    getFieldsList () { return ConfigInstance.getFieldsList({ writableOnly: true }) }
  },
  ConfigBoot,
  ConfigCleanData
}

module.exports = ({ reboot = false, clean = false }) => {
  if (reboot === false || !ConfigInstance) {
    return {}
  }
  return {}
}
