const config = require('../config').API.config
const { SequoiaPath } = require('../../core/sequoia-path')
const { SampleInfo } = require('./sampleInfo.class')
const log = require('../logger').createLogger('sampleIndex')

class SampleIndex extends SequoiaPath {
  constructor (filePath) {
    const rootPath = config.field('SamplesDirectory').value
    log.info({ rootPath, filePath }, 'Setting new sample index instance...')

    super(rootPath)
    const ExtensionsPolicyForSamples = config.field('ExtensionsPolicyForSamples').value

    const options = {
      filePath,
      ObjectClass: SampleInfo,
      excludedPaths: config.field('SamplesDirectoryExclusions').value || undefined
    }

    if (ExtensionsPolicyForSamples === 'E') {
      options.excludedExtensions = config.field('ExcludedExtensionsForSamples').value || undefined
    } else if (config.field('ExtensionsPolicyForSamples') === 'I') {
      options.includedExtensions = config.field('IncludedExtensionsForSamples').value || undefined
    }

    log.info({ rootPath, ...options }, 'Setting options for sample index...')
    this.options(options)
    log.info({ ...this.data.options }, 'Final options for sample index.')
  }
}

module.exports = {
  SampleIndex
}
