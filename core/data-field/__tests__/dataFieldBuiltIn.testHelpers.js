const path = require('path')
const { fileUtils } = require('../../utils/file.utils')

const { DataFieldBuiltInFactory } = require('../dataFieldBuiltIn.factory')
const DFBF = new DataFieldBuiltInFactory()

const rootDir = path.parse(__dirname).root
const testDir = path.join(__dirname, 'test_dir')

module.exports = (schemaType) => {
  const isRelField = schemaType.startsWith('rel')

  const basePath = (isRelField ? testDir : undefined)
  const invalidTestPath = (isRelField ? rootDir : 'invalid')

  return {
    rootDir,
    testDir,
    DFBF,

    throwInvalidPathFn: (errorType) => {
      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            basePath
          },
          value: invalidTestPath
        })
      }).toThrow(errorType)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath
        }
      })

      expect(function () {
        field1.value = invalidTestPath
      }).toThrow(errorType)
    },

    throwInvalidBasePathFn: (errorType) => {
      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            basePath: 'invalid'
          },
          value: 'dir123'
        })
      }).toThrow(errorType)
    },

    throwPathNotExistsFn: (errorType, pathString) => {
      expect(fileUtils.directoryExistsSync(pathString) || fileUtils.fileExistsSync(pathString)).toEqual(false)

      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            basePath,
            presence: true
          },
          value: pathString
        })
      }).toThrow(errorType)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath,
          presence: true
        }
      })

      expect(function () {
        field1.value = pathString
      }).toThrow(errorType)
    },

    throwPathAlreadyExistsFn: (errorType, pathString, basePath) => {
      const testPathString = (basePath ? path.join(basePath, pathString) : pathString)
      expect(fileUtils.directoryExistsSync(testPathString) || fileUtils.fileExistsSync(testPathString)).toEqual(true)

      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            basePath,
            presence: false
          },
          value: pathString
        })
      }).toThrow(errorType)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath,
          presence: false
        }
      })

      expect(function () {
        field1.value = pathString
      }).toThrow(errorType)
    },

    throwPathNotCreatedFn: (errorType, pathString) => {
      const basePath = (isRelField ? `${rootDir}-:!@#$%^&*` : undefined)
      pathString = `${(isRelField ? '' : rootDir)}-:!@#$%^&*??><{}[]\\/.!~${pathString}`
      console.log(`[${schemaType}]`, 'bad path used for throwPathNotCreatedFn:', pathString)

      expect(function () {
        const f1 = DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            basePath,
            ensure: true
          },
          value: pathString
        })
        console.log(f1.fn.toAbsPath())
      }).toThrow(errorType)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath,
          ensure: true
        }
      })

      expect(function () {
        field1.value = pathString
      }).toThrow(errorType)
    },

    supportEmptyInitialPath: (errorType) => {
      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            basePath
          },
          value: ''
        })
      }).toThrow(errorType)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath
        },
        value: null
      })

      expect(field1.value).toEqual(null)
      expect(field1.valueRef).toEqual(null)
      expect(field1.unset).toEqual(true)
    },

    supportDefaultPath: (pathString, basePath) => {
      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath
        },
        value: pathString
      })

      expect(field1.value).toEqual(pathString)
      expect(field1.valueRef).toEqual(pathString)
      expect(field1.unset).toEqual(false)
    },

    schemaPresenceTrueFn: (pathString, basePath) => {
      const testPathString = (basePath ? path.join(basePath, pathString) : pathString)
      expect(fileUtils.directoryExistsSync(testPathString) || fileUtils.fileExistsSync(testPathString)).toEqual(true)

      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            basePath,
            presence: true
          },
          value: pathString
        })
      }).not.toThrow()

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath,
          presence: true
        }
      })

      expect(function () {
        field1.value = pathString
      }).not.toThrow()
    },

    schemaPresenceFalseFn: (pathString, basePath) => {
      const testPathString = (basePath ? path.join(basePath, pathString) : pathString)
      expect(fileUtils.directoryExistsSync(testPathString) || fileUtils.fileExistsSync(testPathString)).toEqual(false)

      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            basePath,
            presence: false
          },
          value: pathString
        })
      }).not.toThrow()

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath,
          presence: false
        }
      })

      expect(function () {
        field1.value = pathString
      }).not.toThrow()
    },

    schemaEnsureFn: (pathString, deletePath, basePath) => {
      const testPathString = (basePath ? path.join(basePath, pathString) : pathString)

      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            basePath,
            ensure: true
          },
          value: pathString
        })
      }).not.toThrow()

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath,
          ensure: true
        }
      })

      expect(function () {
        field1.value = pathString
      }).not.toThrow()

      expect(fileUtils.directoryExistsSync(testPathString) || fileUtils.fileExistsSync(testPathString)).toEqual(true)

      if (deletePath === true) {
        fileUtils.removeDirSync(testPathString)
        fileUtils.removeFileSync(testPathString)
      }
    },

    customFnExists: async (pathString, basePath) => {
      const testPathString = (basePath ? path.join(basePath, pathString) : pathString)
      expect(fileUtils.directoryExistsSync(testPathString) || fileUtils.fileExistsSync(testPathString)).toEqual(true)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath,
          presence: true
        }
      })
      field1.value = pathString

      await expect(field1.fn.exists()).resolves.toEqual(true)
    },

    customFnEnsureDelete: async (pathString, basePath) => {
      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath
        }
      })
      field1.value = pathString

      await expect(field1.fn.ensure()).resolves.toEqual(true)

      await expect(field1.fn.delete()).resolves.toEqual(true)
    },

    customFnChangeBasePath: (newBasePath) => {
      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath
        }
      })

      expect(field1.fn.changeBasePath('invalid')).toEqual(false)
      expect(field1.schema.basePath).toEqual(basePath)

      expect(field1.fn.changeBasePath(newBasePath)).toEqual(true)
      expect(field1.schema.basePath).toEqual(newBasePath)
    },

    customFnFromAbsPath: (pathString, basePath, pathStringFrom, pathStringFromInvalid) => {
      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath
        },
        value: pathString
      })

      expect(field1.value).toEqual(pathString)

      expect(field1.fn.fromAbsPath(pathStringFrom)).toEqual(true)
      expect(pathStringFrom.endsWith(field1.value)).toEqual(true)

      expect(field1.fn.fromAbsPath(pathStringFromInvalid)).toEqual(false)
      expect(pathStringFrom.endsWith(field1.value)).toEqual(true)
    },

    customFnToAbsPath: (pathString, basePath) => {
      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          basePath
        },
        value: pathString
      })

      expect(field1.value).toEqual(pathString)
      expect(field1.fn.toAbsPath()).toEqual(path.join(basePath, pathString))
    }
  }
}
