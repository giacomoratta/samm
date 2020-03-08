const os = require('os')
const path = require('path')
const { JsonizedFile } = require('../../core/jsonized-file')

class ConfigFile extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true })

    const basePath = path.parse(filePath).dir
    this.PlatformSignature = `${os.platform()}-${os.release()}`

    this.addField({
      name: 'Platform',
      schema: {
        type: 'string',
        readOnly: true
      },
      value: this.PlatformSignature,
      description: 'Name and version of the current platform in order to avoid to reuse the config file on the wrong system'
    })

    this.addField({
      name: 'SamplesDirectory',
      schema: {
        type: 'absDirPath',
        checkExists: true,
        default: basePath
      },
      description: 'Directory with samples to scan and search in'
    })

    this.addField({
      name: 'SamplesDirectoryExclusions',
      schema: {
        type: 'array',
        items: {
          type: 'relDirPath',
          basePath: this.get('SamplesDirectory') || basePath
        },
        default: [
          'samplePack1',
          'samplePack2'
        ]
      },
      description: 'Directories (paths) which must be skipped during the scan process of samples directory; these paths are relative to SamplesDirectory path'
    })

    this.addField({
      name: 'RandomCount',
      schema: {
        type: 'number',
        positive: true,
        integer: true
      },
      value: 15,
      description: 'Maximum number of random samples selected after a search'
    })

    this.addField({
      name: 'MaxSamplesSameDirectory',
      schema: {
        type: 'number',
        positive: true,
        integer: true
      },
      value: 2,
      description: 'Maximum number of samples from the same directory, to avoid too many samples from the same family'
    })

    this.addField({
      name: 'ExcludedExtensionsForSamples',
      schema: {
        type: 'array',
        items: 'string',
        default: ['exe', 'DS_Store', 'info']
      },
      description: 'The list of extensions which the samples must NOT have'
    })

    this.addField({
      name: 'IncludedExtensionsForSamples',
      schema: {
        type: 'array',
        items: 'string',
        default: ['wav', 'mp3']
      },
      description: 'The list of extensions which the samples must have'
    })

    this.addField({
      name: 'ExtensionsPolicyForSamples',
      schema: {
        type: 'enum',
        values: ['X', 'I', 'E']
      },
      value: 'X',
      description: '\'I\' to get files with declared extensions only, \'E\' to exclude file with some extensions, and \'X\' to disable the extension filter'
    })

    this.addField({
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

    this.getField('SamplesDirectory').on('change', ({ newValue }) => {
      this.getField('Status').add('new-scan-needed', true)
      this.getField('SamplesDirectoryExclusions').schema = {
        items: {
          basePath: newValue
        }
      }
    })

    this.getField('SamplesDirectoryExclusions').on('change', () => {
      this.getField('Status').add('new-scan-needed', true)
    })

    this.getField('ExtensionsPolicyForSamples').on('change', () => {
      this.getField('Status').add('new-scan-needed', true)
    })

    this.getField('ExcludedExtensionsForSamples').on('change', () => {
      if (this.get('ExtensionsPolicyForSamples') === 'E') {
        this.getField('Status').add('new-scan-needed', true)
      }
    })

    this.getField('IncludedExtensionsForSamples').on('change', () => {
      if (this.get('ExtensionsPolicyForSamples') === 'I') {
        this.getField('Status').add('new-scan-needed', true)
      }
    })
  }

  async load () {
    const generateFile = !(await this.fileHolder.exists())
    if (await super.load() !== true) return false
    generateFile === true && await this.save()
    if (this.get('Platform') !== this.PlatformSignature) {
      return this.reset()
    }
    return true
  }
}

module.exports = {
  ConfigFile
}
