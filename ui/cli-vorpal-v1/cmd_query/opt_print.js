const { API } = require('../../ui_common')
const PathQuery = API.pathQuery

module.exports = {
  one: function ({ paramQueryLabel, cliNext, cliPrinter }) { // todo
    const pathBasedQuery = PathQuery.get(paramQueryLabel)
    if (!pathBasedQuery) {
      cliPrinter.warn(`Query '${paramQueryLabel}' not found!`)
    } else {
      cliPrinter.info(`${paramQueryLabel}: ${pathBasedQuery.paramQueryString}`)
    }
    return cliNext()
  },

  list: function ({ cliNext, cliPrinter }) {
    const pathBasedQueryList = PathQuery.list()
    if (!pathBasedQueryList || pathBasedQueryList.length === 0) {
      cliPrinter.warn('No queries found!')
    } else {
      pathBasedQueryList.forEach((q) => {
        cliPrinter.info(`${q.label}: ${q.queryString}`)
      })
    }
    return cliNext()
  }
}
