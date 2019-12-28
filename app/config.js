const basePath = process.env.ABSOLUTE_APP_PATH
const path = require('path')
const { JsonizedFile } = require('../core/jsonized-file')

class ConfigFile extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true })
  }

  statusMessages() {
    const statusFlags = this.get('Status')
    let statusMessages = ''
    if(statusFlags['first-scan-needed'] === true) {
      statusMessages += `First samples scan needed before start using the app. \n`
    }
    else if(statusFlags['new-scan-needed'] === true) {
      statusMessages += `New samples scan needed to keep using the app. \n`
    }
    return statusMessages
  }
}

const Config = new ConfigFile(path.join(basePath, 'config.json'))

Config.addField({
  name: 'UserdataDirectory',
  schema: {
    type: 'relDirPath',
    basePath: basePath,
    createIfNotExists: true,
    readOnly: true
  },
  value: 'userdata',
  description: 'Directory for storing all the user data'
})

Config.addField({
  name: 'SamplesIndexFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'samples_index'
})

Config.addField({
  name: 'ProjectHistoryFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'project_history'
})

Config.addField({
  name: 'BookmarksFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'bookmarks'
})

Config.addField({
  name: 'QueriesFile',
  schema: {
    type: 'relFilePath',
    basePath: Config.getField('UserdataDirectory').get(),
    createIfNotExists: true,
    readOnly: true
  },
  value: 'queries'
})

Config.addField({
  name: 'SamplesDirectory',
  schema: {
    type: 'absDirPath',
    checkExists: true
  },
  value: basePath
})

Config.addField({
  name: 'CurrentProject',
  schema: {
    type: 'absDirPath',
    checkExists: true
  },
  value: basePath
})

Config.addField({
  name: 'RandomCount',
  schema: {
    type: 'number',
    positive: true,
    integer: true
  },
  value: 15
})

Config.addField({
  name: 'MaxOccurrencesSameDirectory',
  schema: {
    type: 'number',
    positive: true,
    integer: true
  },
  value: 2
})

Config.addField({
  name: 'ExcludedExtensionsForSamples',
  schema: {
    type: 'array',
    items: 'string',
    default: ['exe','DS_Store','info']
  }
})

Config.addField({
  name: 'IncludedExtensionsForSamples',
  schema: {
    type: 'array',
    items: 'string',
    default: ['wav','mp3']
  }
})

Config.addField({
  name: 'ExtensionsPolicy',
  schema: {
    type: 'enum',
    values: [ 'X', 'I', 'E' ]
  },
  value: 'X'
})
//
// Config.addField({
//   name: 'Tags',
//   schema: {
//     type: 'object',
//     props: { },
//     default: {
//       kick: 'techno,kick,deep,sub',
//       impact: 'impact,boom,shot,crash,bomb,808,efx',
//       hihat: 'hihat,hi-hat,hh,top',
//       abstract: 'abstract,complex'
//     }
//   }
// })

// Config.addField({
//   name: 'ProjectHistory',
//   schema: {
//     type: 'array',
//     items: 'string',
//     default: ['']
//   }
// })

Config.addField({
  name: 'Status',
  schema: {
    type: 'object',
    props: {
      'first-scan-needed': { type: 'boolean' },
      'new-scan-needed': { type: 'boolean' },
    }
  },
  value: {
    'first-scan-needed': true,
    'new-scan-needed': true
  }
})

Config.load()

Config.getField('SamplesDirectory').on('change',() => {
  Config.getField('Status').add('new-scan-needed',false)
})

Config.getField('ExcludedExtensionsForSamples').on('change',() => {
  Config.getField('Status').add('new-scan-needed',false)
})

Config.save()

module.exports = {
  Config
}
