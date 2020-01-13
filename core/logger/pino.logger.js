const pino = require('pino')
const childProcess = require('child_process')
const stream = require('stream')

// Environment variables
const cwd = process.cwd()
const { env } = process
const logPath = `${cwd}/log`

// todo create directory
// todo create files

// Create a stream where the logs will be written
const logThrough = new stream.PassThrough()
const log = pino({
  level: (process.env.NODE_ENV === 'production' ? 20 : 10),
  base: {}
}, logThrough)

// Log to multiple files using a separate process
const child = childProcess.spawn(process.execPath, [
  require.resolve('pino-tee'),
  'debug', `${logPath}/logs.log`
  // 'info', `${logPath}/info.log`,
  // 'warn', `${logPath}/warn.log`,
  // 'error', `${logPath}/error.log`,
  // 'fatal', `${logPath}/fatal.log`
], { cwd, env })
logThrough.pipe(child.stdin)

const createLogger = (module) => {
  return log.child({ module })
}

module.exports = {
  createLogger
}
