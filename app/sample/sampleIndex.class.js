const { ConfigAPI } = require('../config')
const { SequoiaPath } = require('../../core/sequoia-path')
const { SampleInfo } = require('./sampleInfo.class')
const log = require('../logger').createLogger('sampleIndex')

class SampleIndex extends SequoiaPath {
  constructor (filePath) {
    const rootPath = ConfigAPI.field('SamplesDirectory').value
    log.info({ rootPath, filePath }, 'Setting new sample index instance...')

    super(rootPath)
    const ExtensionsPolicyForSamples = ConfigAPI.field('ExtensionsPolicyForSamples').value

    const options = {
      filePath,
      ObjectClass: SampleInfo,
      excludedPaths: ConfigAPI.field('SamplesDirectoryExclusions').value || undefined
    }

    if (ExtensionsPolicyForSamples === 'E') {
      options.excludedExtensions = ConfigAPI.field('ExcludedExtensionsForSamples').value || undefined
    } else if (ConfigAPI.field('ExtensionsPolicyForSamples') === 'I') {
      options.includedExtensions = ConfigAPI.field('IncludedExtensionsForSamples').value || undefined
    }

    log.info({ rootPath, ...options }, 'Setting options for sample index...')
    this.options(options)
    log.info({ ...this.data.options }, 'Final options for sample index.')
  }

  async load () {
    try {
      const dataPresence = await super.load()
      log.info({ dataPresence }, 'Loaded successfully')
      ConfigAPI.field('Status').fn.setProp('new-scan-needed', true)
      await ConfigAPI.save()
      return true
    } catch (e) {
      ConfigAPI.field('Status').fn.setProp('first-scan-needed', true)
      ConfigAPI.field('Status').fn.setProp('new-scan-needed', true)
      // it could be a temporary problems, so do not save the status [ no Config.save() ]
      log.error(e, 'Cannot load sample index')
      return false
    }
  }

  async regenerate () {
    if (await this.scan() !== true) {
      ConfigAPI.field('Status').fn.setProp('first-scan-needed', false)
      ConfigAPI.field('Status').fn.setProp('new-scan-needed', false)
      await ConfigAPI.save()
      log.warn('samples root path is empty')
      return false
    }
    if (await this.save() !== true) {
      log.warn('cannot save sample index file')
      return false
    }
    return true
  }
}

module.exports = {
  SampleIndex
}
