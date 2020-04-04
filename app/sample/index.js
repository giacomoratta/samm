const log = require('../logger').createLogger('sample')
const { SampleIndex } = require('./sampleIndex.class')

let SampleIndexInstance = null
let SampleIndexFilePath = null

/**
 * Healthy check before using SampleIndexAPI to avoid some useless errors.
 * Check if the index is not present or not ready (missing rootPath).
 * @returns {boolean}
 * @private
 */
const _absentSampleIndex = () => {
  return !SampleIndexInstance || !SampleIndexInstance.rootPath
}

const boot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  SampleIndexFilePath = filePath
  SampleIndexInstance = new SampleIndex(SampleIndexFilePath)
  return SampleIndexInstance.load()
}

const clean = async () => {
  log.info('Cleaning data...')
  if (SampleIndexInstance) {
    await SampleIndexInstance.clean()
  }
}

module.exports = {
  boot,
  clean,

  SampleSetAPI: {
    create: ({ queryString, queryLabel, pathBasedQuery }) => {

    },
    latest: () => {}
  },

  SampleLookAPI: {
    create: ({ queryString, queryLabel, pathBasedQuery }) => {},
    latest: () => {}
  },

  SampleIndexAPI: {

    /**
     * Current sample index is not set and any usage will throw errors.
     * With this function, many errors could be prevented.
     * @returns {boolean}
     */
    absent: () => {
      return _absentSampleIndex()
    },

    empty: () => {
      if (_absentSampleIndex()) return true
      return SampleIndexInstance.empty
    },

    size: () => {
      if (_absentSampleIndex()) return -1
      return SampleIndexInstance.fileCount
    },

    /**
     * Create and save a new sample index (and destroy the previous one).
     * @returns {Promise<boolean>}
     */
    create: async () => {
      if (!SampleIndexInstance) return false
      await SampleIndexInstance.clean()
      SampleIndexInstance = new SampleIndex(SampleIndexFilePath)
      return SampleIndexInstance.regenerate()
    }
  }
}
