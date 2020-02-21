const path = require('path')
const { fileUtils } = require('../../utils/file.utils')

const rootDir = path.parse(__dirname).root
const testDir = path.join(__dirname, 'test_dir')

module.exports = (dfbf, schemaType) => {
  return {

    rootDir,
    testDir,

    throwInvalidPathFn: (errorType) => {
      expect(function () {
        dfbf.create({
          name: 'fieldName1',
          schema: {
            type: schemaType
          },
          value: 'invalid'
        })
      }).toThrow(errorType)

      const field1 = dfbf.create({
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
        dfbf.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            presence: true
          },
          value: pathString
        })
      }).toThrow(errorType)

      const field1 = dfbf.create({
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
        dfbf.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            presence: false
          },
          value: pathString
        })
      }).toThrow(errorType)

      const field1 = dfbf.create({
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
      console.log('throwPathNotCreatedFn - bad path:', pathString)

      expect(function () {
        dfbf.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            ensure: true
          },
          value: pathString
        })
      }).toThrow(errorType)

      const field1 = dfbf.create({
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

    schemaPresenceTrueFn: (pathString) => {
      expect(fileUtils.directoryExistsSync(pathString) || fileUtils.fileExistsSync(pathString)).toEqual(true)

      expect(function () {
        dfbf.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            presence: true
          },
          value: pathString
        })
      }).not.toThrow()

      const field1 = dfbf.create({
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
        dfbf.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            presence: false
          },
          value: pathString
        })
      }).not.toThrow()

      const field1 = dfbf.create({
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
        dfbf.create({
          name: 'fieldName1',
          schema: {
            type: schemaType,
            ensure: true
          },
          value: pathString
        })
      }).not.toThrow()

      const field1 = dfbf.create({
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

      const field1 = dfbf.create({
        name: 'fieldName2',
        schema: {
          type: schemaType,
          presence: true
        }
      })

      expect(field1.fn.exists()).resolves.toEqual(true)
    }
  }
}
