const os = require('os')

const libUtils = {}

// https://nodejs.org/dist/latest-v8.x/docs/api/os.html#os_os_platform
/*
os.EOL
os.arch()
os.cpus()
os.endianness()
os.freemem()
os.homedir()
os.hostname()
os.loadavg()
os.networkInterfaces()
os.platform()
os.release()
os.tmpdir()
os.totalmem()
os.type()
os.uptime()
*/

libUtils.EOL = os.EOL

libUtils.isWindows = () => {
  return os.platform() === 'win32'
}

libUtils.isMacOS = () => {
  return os.platform() === 'darwin'
}

module.exports = libUtils
