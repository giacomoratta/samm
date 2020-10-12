const { App } = require('../ui_common')
const { PathQueryAPI } = App

module.exports = {
  one: function ({ paramQueryLabel, cliNext, cliPrinter }) { // todo
    const pathBasedQuery = PathQueryAPI.get(paramQueryLabel)
    if (!pathBasedQuery) {
      cliPrinter.info(`Query '${paramQueryLabel}' not found!`)
    } else {
      cliPrinter.info(`${paramQueryLabel}: ${pathBasedQuery.paramQueryString}`)
    }
    return cliNext()
  },

  list: function ({ cliNext, cliPrinter }) {
    const pathBasedQueryList = PathQueryAPI.list()
    if (!pathBasedQueryList || pathBasedQueryList.length === 0) {
      cliPrinter.info('No queries found!')
    } else {
      pathBasedQueryList.forEach((q) => {
        cliPrinter.info(`${q.label}: ${q.queryString}`)
      })
    }
    return cliNext()
  }
}
