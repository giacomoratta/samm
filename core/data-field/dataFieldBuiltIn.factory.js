/**
 * This is also an example on how a new DataFieldFactory should be created.
 * The project should have a DataFieldFactory exported as singleton, which must contain messages, defined fields, etc.
 * Before exporting it, the method init() must be called in order to instantiate the internal validator which will be
 * used by all the DataField(s) created in the project.
 *
 *  1) extends the a DataFieldFactory class
 *  2) declare messages
 *  3) define fields
 *  4) export as singleton (when used in project)
 *
 *  EDIT: no init, just act as singleton (new if not instance, init, etc.)!!!
 */

const { DataFieldFactory } = require('../dataField.factory')

class DataFieldBuiltInFactory extends DataFieldFactory {

  constructor () {
    super()

    // this.message({ })

    // this._defineCircularArray()
    // this._defineRelFilePath()
    // this._defineRelDirPath()
    // this._defineAbsFilePath()
    // this._defineAbsDirPath()
  }

  //_defineCircularArray() {}
  //_defineRelFilePath() {}
  //_defineRelDirPath() {}
  //_defineAbsFilePath() {}
  //_defineAbsDirPath() {}
}

module.exports = {
  DataFieldBuiltInFactory
}
