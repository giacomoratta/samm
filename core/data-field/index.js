const { DataFieldFactory } = require('./dataField.factory')
const { DataFieldError } = require('./dataField.error')

const DataFieldFactoryInstance = new DataFieldFactory()

// require('./dataField.circularArray')(DataFieldFactoryInstance)
// no init here!

module.exports = {
  DataFieldFactory: DataFieldFactoryInstance,
  DataFieldError
}
