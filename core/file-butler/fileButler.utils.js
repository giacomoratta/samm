const path = require('path')
const { _ } = require('../utils/lodash.extended')
const { fileUtils } = require('../utils/file.utils')
const { FileButlerError } = require('./fileButlerError.class')

const ENUMS = {
  fileType: {
    json: 'json',
    json_compact: 'json-compact',
    text: 'text'
  }
}

const getDefaultValue = function (fileType) {
  if (ENUMS.fileType.json === fileType || ENUMS.fileType.json_compact === fileType) {
    return null
  } else if (ENUMS.fileType.text === fileType) {
    return ''
  }
}

const getValidityCheckFn = function (fileType) {
  if (ENUMS.fileType.json === fileType || ENUMS.fileType.json_compact === fileType) {
    return _.isStrictObject
  } else if (ENUMS.fileType.text === fileType) {
    return _.isString
  }
}

const getLoadFromFileFn = function (fileType) {
  if (ENUMS.fileType.json === fileType || ENUMS.fileType.json_compact === fileType) {
    return async function (filePath) {
      try {
        const result = await fileUtils.readJsonFile(filePath)
        if (!result || result === false) return null
        return result
      } catch (error) {
        return null
      }
    }
  } else if (ENUMS.fileType.text === fileType) {
    return async function (filePath) {
      try {
        const result = await fileUtils.readTextFile(filePath)
        if (!result || result === false) return null
        return result
      } catch (e) {
        return null
      }
    }
  }
}

const getSaveToFileFn = function (fileType) {
  if (ENUMS.fileType.json === fileType) {
    return function (filePath, content) {
      return fileUtils.writeJsonFile(filePath, content)
    }
  } else if (ENUMS.fileType.json_compact === fileType) {
    return function (filePath, content) {
      return fileUtils.writeJsonFile(filePath, content, false)
    }
  } else if (ENUMS.fileType.text === fileType) {
    return function (filePath, content) {
      return fileUtils.writeTextFile(filePath, content)
    }
  }
}

const parseOption = async function (options) {


  if (!options.cloneFrom && !await fileUtils.fileExists(options.filePath)) {
    const parent2 = path.parse(options.filePath).dir
    const parent1 = path.parse(parent2).dir
    if (!await fileUtils.directoryExists(parent1)) {
      throw new FileButlerError(`One of the parent directories do not exist: ${parent1} .`)
    }
    if (!await fileUtils.ensureDir(parent2)) {
      throw new FileButlerError(`The parent directory cannot be created: ${parent2} .`)
    }
    if (!fileUtils.writeFileSync(options.filePath, '')) {
      throw new FileButlerError(`File specified in 'filePath' cannot be created: ${options.filePath} .`)
    }
  }

  if (!options.fileType || !Object.values(ENUMS.fileType).includes(options.fileType)) {
    throw new FileButlerError(`'fileType' option must be present and have one of these values: ${Object.values(ENUMS.fileType).join(', ')} .`)
  }

  const parsed = {
    filePath: null,
    fileType: 'json',

    /* Behaviour */
    cloneFrom: '', // if filePath does not exist, clone from this path
    backupTo: '', // after save, copy the file in filePath to this path

    // preLoad: false, // calls loadFn after creating relationship
    // autoLoad: false, // calls loadFn if it has no data
    // preSet: false, // calls setFn after creating relationship
    // autoSet: false, // calls setFn if it has no data
    // autoSave: false, // calls saveFn after loadFn or setFn

    /* Custom functions */
    loadFn: null,
    saveFn: null,

    ...options
  }

  parsed.defaultValue = getDefaultValue((parsed.fileType))

  parsed.fn = {}
  parsed.fn.validityCheck = getValidityCheckFn(parsed.fileType)
  parsed.fn.loadFromFile = getLoadFromFileFn(parsed.fileType)
  parsed.fn.saveToFile = getSaveToFileFn(parsed.fileType)

  return parsed
}

module.exports = {
  parseOption
}
