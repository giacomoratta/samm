const libUtils = {}

libUtils.EXIT = (message, data) => {
  if (message) console.log('\n' + message)
  if (data) console.log(data)
  console.log('Process terminated.\n')
  process.exit(0)
}

module.exports = {
  processUtils: libUtils
}
