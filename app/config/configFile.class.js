const path = require('path')
const { JsonizedFile } = require('../../core/jsonized-file')
const { DataFieldBuiltInFactory } = require('../../core/data-field/dataFieldBuiltIn.factory')

class ConfigFile extends JsonizedFile {
  constructor (filePath, cloneFrom) {
    super({ filePath, prettyJson: true, cloneFrom })

    const fallbackBasePath = path.parse(filePath).dir

    this.DFBF = new DataFieldBuiltInFactory()
    this.DFBF.initFactory()

    this.add(this.DFBF.create({
      name: 'SamplesDirectory',
      schema: {
        type: 'absDirPath',
        checkExists: true
      },
      description: 'Directory with samples to scan and search in (absolute path)'
    }))

    this.add(this.DFBF.create({
      name: 'LookRandomCount',
      schema: {
        type: 'number',
        positive: true,
        integer: true
      },
      value: 15,
      description: 'Maximum number of random samples selected after a search'
    }))

    this.add(this.DFBF.create({
      name: 'LookRandomSameDirectory',
      schema: {
        type: 'number',
        positive: true,
        integer: true
      },
      value: 2,
      description: 'Maximum number of samples from the same directory, to avoid too many samples from the same family'
    }))

    this.add(this.DFBF.create({
      name: 'SamplesDirectoryExclusions',
      schema: {
        type: 'array',
        items: {
          type: 'relDirPath',
          basePath: this.field('SamplesDirectory').value || fallbackBasePath
        }
      },
      // value: [
      //   'samplePack1',
      //   'samplePack2'
      // ],
      description: 'Directories which must be skipped during the scan process of samples directory; these paths are relative to SamplesDirectory path; add or remove (with -r option) multiple values'
    }))

    this.add(this.DFBF.create({
      name: 'ExcludedExtensionsForSamples',
      schema: {
        type: 'array',
        items: 'string'
      },
      // value: ['exe', 'DS_Store', 'info'],
      description: 'The list of file extensions to skip during the sample scan; add or remove (with -r option) multiple values'
    }))

    this.add(this.DFBF.create({
      name: 'IncludedExtensionsForSamples',
      schema: {
        type: 'array',
        items: 'string'
      },
      // value: ['wav', 'mp3'],
      description: 'The list of file extensions which samples must have; add or remove (with -r option) multiple values'
    }))

    this.add(this.DFBF.create({
      name: 'ExtensionsPolicyForSamples',
      schema: {
        type: 'enum',
        values: ['X', 'I', 'E']
      },
      value: 'X',
      description: 'Policy for sample scan: \'I\' to get files with declared extensions only, \'E\' to exclude file with some extensions, and \'X\' to disable the extension filter'
    }))

    this.add(this.DFBF.create({
      name: 'TemplatesDirectory',
      schema: {
        type: 'absDirPath'
      },
      description: 'Directory where all templates are located; they can be used to start a ready-to-go project instead of an empty one'
    }))

    this.add(this.DFBF.create({
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
    }))

    this.field('SamplesDirectory').on('change', ({ newValue }) => {
      this.field('Status').fn.setProp('new-scan-needed', true)
      this.field('SamplesDirectoryExclusions').schema = {
        items: {
          basePath: newValue
        }
      }
    })

    this.field('SamplesDirectoryExclusions').on('change', () => {
      this.field('Status').fn.setProp('new-scan-needed', true)
    })

    this.field('ExtensionsPolicyForSamples').on('change', () => {
      this.field('Status').fn.setProp('new-scan-needed', true)
    })

    this.field('ExcludedExtensionsForSamples').on('change', () => {
      if (this.field('ExtensionsPolicyForSamples').valueRef === 'E') {
        this.field('Status').fn.setProp('new-scan-needed', true)
      }
    })

    this.field('IncludedExtensionsForSamples').on('change', () => {
      if (this.field('ExtensionsPolicyForSamples').valueRef === 'I') {
        this.field('Status').fn.setProp('new-scan-needed', true)
      }
    })
  }

  async load () {
    const generateFile = !(await this.fileHolder.exists())
    if (await super.load() === true) return true
    if (generateFile === true) return /* await */ this.save()
    return false
  }
}

module.exports = {
  ConfigFile
}
