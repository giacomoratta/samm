const { JsonizedFile } = require('../../core/jsonized-file')
const { Project } = require('./project.class')
const { SpheroidCache } = require('../../core/spheroid-cache')

class ProjectHistoryJsonFile {
  constructor (filePath) {
    this.ProjectHistoryCache = new SpheroidCache({ maxSize: 15 })
    this.pathMap = new Map()

    this.jsonFile = new JsonizedFile({ filePath, prettyJson: true })
    this.jsonFile.addField({
      name: 'ProjectHistory',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          props: {
            name: { type: 'string' },
            path: { type: 'string' }
          }
        },
        default: [
          {
            name: 'project_name1',
            path: '/path/project_name1'
          }
        ]
      }
    })
  }

  save () {
    const phCollection = []
    this.ProjectHistoryCache.forEach(({ label, value }) => {
      phCollection.push(value.toJson())
    })
    this.jsonFile.set('ProjectHistory', phCollection)
    return this.jsonFile.save()
  }

  load () {
    let newProjectNode
    this.jsonFile.load()
    this.ProjectHistoryCache.reset()
    const phCollection = this.jsonFile.get('ProjectHistory')
    if (!(phCollection instanceof Array) || phCollection.length === 0) return
    for (let i = phCollection.length - 1; i >= 0; i--) {
      newProjectNode = new Project()
      newProjectNode.fromJson(phCollection[i])
      this.ProjectHistoryCache.add(newProjectNode)
    }
  }

  get latest () {
    return this.ProjectHistoryCache.latest
  }

  get oldest () {
    return this.ProjectHistoryCache.oldest
  }

  add (projectPath) {
    const newProjectNode = new Project({ projectPath })
    if (!newProjectNode.isValid()) return false
    this.ProjectHistoryCache.forEach(({ label, value }) => {
      if (value.path === projectPath) {
        this.ProjectHistoryCache.remove(label)
      }
    })
    this.ProjectHistoryCache.add(newProjectNode)
    return true
  }

  forEach (callback) {
    this.ProjectHistoryCache.forEach(({ label, value }) => {
      callback(value)
    })
  }
}

module.exports = {
  ProjectHistoryJsonFile
}
