const path = require('path')
const pino = require('pino')
const childProcess = require('child_process')
const stream = require('stream')

// Environment variables
const cwd = process.cwd()
const { env } = process
const logPath = path.join(cwd, 'log')

// todo create directory
// todo create files

let mainLogFile = 'logs.log'
if (process.env.NODE_ENV === 'test') mainLogFile = 'test.log'
mainLogFile = path.join(logPath, mainLogFile)

// Create a stream where the logs will be written
const logThrough = new stream.PassThrough()
const log = pino({
  prettyPrint: { colorize: true },
  level: (process.env.NODE_ENV === 'production' ? 20 : 10),
  base: {}
}, logThrough)

// Log to multiple files using a separate process
const child = childProcess.spawn(process.execPath, [
  require.resolve('pino-tee'),
  'debug', mainLogFile
  // 'info', `${logPath}/info.log`,
  // 'warn', `${logPath}/warn.log`,
  // 'error', `${logPath}/error.log`,
  // 'fatal', `${logPath}/fatal.log`
], { cwd, env })
logThrough.pipe(child.stdin)

// const cleanLoggingProcesses = (a,b) => {
//   console.log(a,b)
//   child.kill('SIGINT')
// }
//
// process.on('exit', cleanLoggingProcesses.bind(null, {exit:true}))
// process.on('SIGINT', cleanLoggingProcesses.bind(null, {exit:true}))
// process.on('SIGUSR1', cleanLoggingProcesses.bind(null, {exit:true}))
// process.on('SIGUSR2', cleanLoggingProcesses.bind(null, {exit:true}))
// process.on('uncaughtException', cleanLoggingProcesses.bind(null, {exit:true}))

const createLogger = (module) => {
  return log.child({ module })
}

module.exports = {
  createLogger
}
