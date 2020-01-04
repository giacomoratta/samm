const fileUtils = require('../../utils/file.utils')
const path = require('path')
const { DataField } = require('../index')

// todo

describe('dataField class and object', function () {
  it('should change basePath for relDirPath field5', function () {
    const newDataField = function (args) {
      return new DataField(args)
    }

    const x1_props = {
      name: 'fieldname1',
      schema: { type: 'relDirPath', basePath: __dirname, checkExists: false, createIfNotExists: false, deleteIfExists: false },
      value: 'abc/file_utils_test_dirx'
    }
    const x1_props_ch1 = {
      basePath: path.join(__dirname, 'NEW')
    }

    const x1 = newDataField(x1_props)
    console.log(x1.get())

    x1.changeSchema(x1_props_ch1)
    console.log(x1.get())

    const x2_props = {
      name: 'fieldname1',
      schema: {
        type: 'array',
        items: {
          type: 'relDirPath',
          basePath: __dirname
        }
      },
      value: [
        'samplePack1',
        'samplePack2'
      ]
    }
    const x2_props_ch1 = {
      items: {
        basePath: path.join(__dirname, 'NEW')
      }
    }

    const x2 = newDataField(x2_props)
    console.log(x2.get())

    x2.changeSchema(x2_props_ch1)
    console.log(x2.get())
  })

  it('should change basePath for relDirPath field4', function () {
    const newDataField = function (args) {
      return new DataField(args)
    }

    const x2_props = {
      name: 'fieldname1',
      schema: {
        type: 'object',
        props: {
          path123: {
            type: 'relDirPath',
            basePath: __dirname
          },
          path456: {
            type: 'array',
            items: {
              type: 'relDirPath',
              basePath: __dirname
            }
          }
        }
      },
      value: {
        path123: 'samplePack1',
        path456: [
          'samplePack42',
          'samplePack43',
          'samplePack44'
        ]
      }
    }
    const x2_props_ch1 = {
      schema: {
        items: {
          basePath: path.join(__dirname, 'NEW')
        }
      }
    }

    const x2 = newDataField(x2_props)

    console.log(x2.get())
  })

  it('should change basePath for relDirPath field3', function () {
    const newDataField = function (args) {
      return new DataField(args)
    }

    const x2_props = {
      name: 'fieldname1',
      schema: {
        type: 'object',
        props: {
          path123: {
            type: 'relDirPath',
            basePath: __dirname
          },
          path456: {
            type: 'relDirPath',
            basePath: __dirname
          }
        }
      },
      value: {
        path123: 'samplePack1',
        path456: 'samplePack2'
      }
    }
    const x2_props_ch1 = {
      schema: {
        items: {
          basePath: path.join(__dirname, 'NEW')
        }
      }
    }

    const x2 = newDataField(x2_props)

    console.log(x2.get())
  })

  it('should change basePath for relDirPath field2', function () {
    const newDataField = function (args) {
      return new DataField(args)
    }

    const x2_props = {
      name: 'fieldname1',
      schema: {
        type: 'array',
        items: {
          type: 'relDirPath',
          basePath: __dirname
        }
      },
      value: [
        'samplePack1',
        'samplePack2'
      ]
    }
    const x2_props_ch1 = {
      schema: {
        items: {
          basePath: path.join(__dirname, 'NEW')
        }
      }
    }

    const x2 = newDataField(x2_props)

    console.log(x2.get())
  })

  it('should change basePath for relDirPath field', function () {
    const newDataField = function (args) {
      return new DataField(args)
    }

    const x1_props = {
      name: 'fieldname1',
      schema: { type: 'relDirPath', basePath: __dirname, checkExists: false, createIfNotExists: false, deleteIfExists: false },
      value: 'abc/file_utils_test_dirx'
    }
    const x1_props_ch1 = {
      schema: {
        basePath: path.join(__dirname, 'NEW')
      }
    }

    // console.log(x1_props.schema)
    // console.log({ ...x1_props.schema, ...x1_props_ch1.schema })

    // return
    // let x1 = newDataField(x1_props)

    // x1.changeSchema({
    //   basePath: path.join(__dirname,'NEW')
    // })
    //
    // console.log(x1.get())

    const x2_props = {
      name: 'fieldname1',
      schema: {
        type: 'array',
        items: {
          type: 'relDirPath',
          basePath: __dirname
        },
        default: [
          'samplePack1',
          'samplePack2'
        ]
      }
    }
    const x2_props_ch1 = {
      schema: {
        items: {
          basePath: path.join(__dirname, 'NEW')
        }
      }
    }
    // console.log(x2_props.schema)
    // console.log({ ...x2_props.schema, ...x2_props_ch1.schema })

    const _ = require('lodash')
    const m1 = _.cloneDeep(_.merge(x2_props.schema, x2_props_ch1.schema))
    m1.default = []
    console.log(m1)
    console.log(x2_props.schema)

    return
    const x2 = newDataField(x2_props)

    x2.changeSchema()

    console.log(x2.get())
  })

  it('should change basePath for relFilePath field', function () {

  })
})
