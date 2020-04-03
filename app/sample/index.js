const log = require('../../core/logger').createLogger('sample')
const { SampleIndex } = require('./sampleIndex.class')

let SampleIndexInstance = null
let SampleIndexFilePath = null

const boot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  SampleIndexFilePath = filePath
  SampleIndexInstance = new SampleIndex(SampleIndexFilePath)
  try {
    const dataPresence = await SampleIndexInstance.load()
    log.info({ dataPresence }, 'Loaded successfully')
    return true
  } catch (e) {
    log.error(e, 'Cannot load sample index')
    return false
  }
}

const clean = async () => {
  log.info('Cleaning data...')
  if (SampleIndexInstance) {
    await SampleIndexInstance.clean()
  }
}

const _absentSampleIndex = () => {
  // has no rootPath
  return !SampleIndexInstance || !SampleIndexInstance.rootPath
}

module.exports = {
  boot,
  clean,

  API: {
    sampleSet: {
      create: ({ queryString, queryLabel, pathBasedQuery }) => {},
      latest: () => {}
    },

    sampleLookup: {
      create: ({ queryString, queryLabel, pathBasedQuery }) => {},
      latest: () => {}
    },

    sampleIndex: {

      /**
       * Current sample index is not set and any usage will throw errors.
       * With this function, many errors could be prevented.
       * @returns {boolean}
       */
      absent: () => {
        return _absentSampleIndex()
      },

      /**
       * Current sample index is empty
       * @returns {boolean}
       */
      empty: () => {
        return SampleIndexInstance.empty
      },

      /**
       * The number of samples (files only)
       * @returns {number}
       */
      size: () => {
        return SampleIndexInstance.fileCount
      },

      /**
       * Create and save a new sample index (and destroy the previous one).
       * @returns {Promise<boolean>}
       */
      create: async () => {
        await SampleIndexInstance.clean()
        SampleIndexInstance = new SampleIndex(SampleIndexFilePath)
        if (await SampleIndexInstance.scan() !== true) {
          log.warn('samples root path is empty')
          return false
        }
        if (await SampleIndexInstance.save() !== true) {
          log.warn('cannot save sample index file')
          return false
        }
        return true
      }
    }
  }
}
