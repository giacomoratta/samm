const path = require('path')
const { fileUtils } = require('../../utils/file.utils')

const { DataFieldBuiltInFactory } = require('../dataFieldBuiltIn.factory')
const DFBF = new DataFieldBuiltInFactory()

const rootDir = path.parse(__dirname).root
const testDir = path.join(__dirname, 'test_dir')

module.exports = (schemaType) => {
  return {
    rootDir,
    testDir,
    DFBF,

    throwInvalidPathFn: (errorType) => {
      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType
          },
          value: 'invalid'
        })
      }).toThrow(errorType)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType
        }
      })

      expect(function () {
        field1.value = 'invalid'
      }).toThrow(errorType)
    },

    throwPathNotExistsFn: (errorType, pathString) => {
      expect(fileUtils.directoryExistsSync(pathString) || fileUtils.fileExistsSync(pathString)).toEqual(false)

      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            presence: true
          },
          value: pathString
        })
      }).toThrow(errorType)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          presence: true
        }
      })

      expect(function () {
        field1.value = pathString
      }).toThrow(errorType)
    },

    throwPathAlreadyExistsFn: (errorType, pathString) => {
      expect(fileUtils.directoryExistsSync(pathString) || fileUtils.fileExistsSync(pathString)).toEqual(true)

      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            presence: false
          },
          value: pathString
        })
      }).toThrow(errorType)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          presence: false
        }
      })

      expect(function () {
        field1.value = pathString
      }).toThrow(errorType)
    },

    throwPathNotCreatedFn: (errorType, pathString) => {
      pathString = `${rootDir}-:!@#$%^&*??><{}[]\\/.!~${pathString}`
      console.log(`[${schemaType}]`, 'bad path used for throwPathNotCreatedFn:', pathString)

      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            ensure: true
          },
          value: pathString
        })
      }).toThrow(errorType)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
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
            type: schemaType
          },
          value: ''
        })
      }).toThrow(errorType)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType
        },
        value: null
      })

      expect(field1.value).toEqual(null)
      expect(field1.valueRef).toEqual(null)
      expect(field1.unset).toEqual(true)
    },

    supportDefaultPath: (pathString) => {
      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType
        },
        value: pathString
      })

      expect(field1.value).toEqual(pathString)
      expect(field1.valueRef).toEqual(pathString)
      expect(field1.unset).toEqual(false)
    },

    schemaPresenceTrueFn: (pathString) => {
      expect(fileUtils.directoryExistsSync(pathString) || fileUtils.fileExistsSync(pathString)).toEqual(true)

      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            presence: true
          },
          value: pathString
        })
      }).not.toThrow()

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          presence: true
        }
      })

      expect(function () {
        field1.value = pathString
      }).not.toThrow()
    },

    schemaPresenceFalseFn: (pathString) => {
      expect(fileUtils.directoryExistsSync(pathString) || fileUtils.fileExistsSync(pathString)).toEqual(false)

      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            presence: false
          },
          value: pathString
        })
      }).not.toThrow()

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          presence: false
        }
      })

      expect(function () {
        field1.value = pathString
      }).not.toThrow()
    },

    schemaEnsureFn: (pathString, deletePath) => {
      expect(function () {
        DFBF.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            ensure: true
          },
          value: pathString
        })
      }).not.toThrow()

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          ensure: true
        }
      })

      expect(function () {
        field1.value = pathString
      }).not.toThrow()

      expect(fileUtils.directoryExistsSync(pathString) || fileUtils.fileExistsSync(pathString)).toEqual(true)

      if (deletePath === true) {
        fileUtils.removeDirSync(pathString)
        fileUtils.removeFileSync(pathString)
      }
    },

    customFnExists: async (pathString) => {
      expect(fileUtils.directoryExistsSync(pathString) || fileUtils.fileExistsSync(pathString)).toEqual(true)

      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          presence: true
        }
      })
      field1.value = pathString

      await expect(field1.fn.exists()).resolves.toEqual(true)
    },

    customFnEnsureDelete: async (pathString, deletePath) => {
      const field1 = DFBF.create({
        name: 'fieldName2',
        schema: {
          type: schemaType
        }
      })
      field1.value = pathString

      await expect(field1.fn.ensure()).resolves.toEqual(true)

      await expect(field1.fn.delete()).resolves.toEqual(true)
    }
  }
}
