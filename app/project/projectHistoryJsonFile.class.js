const { FileButler } = require('../../core/file-butler')
const { Project } = require('./project.class')
const { SpheroidList } = require('../../core/spheroid-list')

class ProjectHistoryJsonFile {
  constructor (filePath) {
    this.filePath = filePath
    this.fileHolder = null
    this.ProjectHistoryCache = new SpheroidList({ maxSize: 15 })
  }

  save () {
    if (!this.fileHolder) return false
    return this.fileHolder.save()
  }

  load ({ autoSave } = {}) {
    const options = {}
    options.filePath = this.filePath
    options.fileType = 'json'
    options.loadFn = (data) => {
      if (!data) return
      this.fromObject(data)
    }

    options.saveFn = () => {
      return this.toObject()
    }

    this.fileHolder = new FileButler(options) /* throw */
    this.fileHolder.load()

    if (autoSave === true) {
      return this.fileHolder.save()
    }
    return true
  }

  toObject () {
    const data = []
    this.ProjectHistoryCache.forEach(({ label, value }) => {
      data.push(value.toJson())
    })
    return data
  }

  fromObject (data) {
    let newProjectNode
    this.ProjectHistoryCache.reset()
    if (!(data instanceof Array) || data.length === 0) return false
    for (let i = data.length - 1; i >= 0; i--) {
      newProjectNode = new Project()
      newProjectNode.fromJson(data[i])
      this.ProjectHistoryCache.add(newProjectNode)
    }
    return true
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

  deleteFile () {
    const tempFileHolder = (this.fileHolder ? this.fileHolder : new FileButler({
      filePath: this.filePath,
      fileType: 'json'
    }))
    return tempFileHolder.delete()
  }
}

module.exports = {
  ProjectHistoryJsonFile
}
