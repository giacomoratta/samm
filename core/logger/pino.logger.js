const path = require('path')
const pino = require('pino')
const childProcess = require('child_process')
const stream = require('stream')

// Environment variables
const cwd = process.cwd()
const { env } = process
let logPath = path.join(cwd, 'logs')

let log = null
const mainLogFile = 'logs.log'
// if (process.env.NODE_ENV === 'test') mainLogFile = 'test.log'
let mainLogFilePath = path.join(logPath, mainLogFile)

const __initLogger__ = () => {
  // Create a stream where the logs will be written
  const logThrough = new stream.PassThrough()
  const log = pino({
    prettyPrint: { colorize: true },
    level: (process.env.NODE_ENV === 'production' ? 20 : 10),
    base: {}
  }, logThrough)

  // Log to multiple files using a separate process
  if (process.env.NODE_ENV !== 'test') {
    const child = childProcess.spawn(process.execPath, [
      require.resolve('pino-tee'),
      'debug', mainLogFilePath
      // 'info', `${logPath}/info.log`,
      // 'warn', `${logPath}/warn.log`,
      // 'error', `${logPath}/error.log`,
      // 'fatal', `${logPath}/fatal.log`
    ], { cwd, env })
    logThrough.pipe(child.stdin)
  }
  return log
}

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

log = __initLogger__()

const createLogger = (module) => {
  return log.child({ module })
}

const setLogsDirectory = (directoryPath) => {
  logPath = directoryPath
  mainLogFilePath = path.join(logPath, mainLogFile)
  log = __initLogger__()
}

module.exports = {
  createLogger,
  setLogsDirectory
}
