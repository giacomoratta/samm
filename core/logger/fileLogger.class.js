const path = require('path')
const fsExtra = require('fs-extra')
const childProcess = require('child_process')
const stream = require('stream')
const pino = require('pino')
const pinoTeeReq = require.resolve('pino-tee')

class FileLogger {
  constructor ({ logsDirPath, minLevel = 10 }) {
    this.mainLogFile = logsDirPath ? path.join(logsDirPath, `${this._generateFileName()}.log`) : null // todo: add date to filename
    logsDirPath && fsExtra.ensureDir(logsDirPath)

    this._init({ logsDirPath, minLevel })
  }

  _init ({ minLevel }) {
    this.logThrough = new stream.PassThrough()
    this.log = pino({
      // name: 'project',
      // prettyPrint: { colorize: true },
      level: minLevel,
      base: {}
    }, this.logThrough)

    // Log to multiple files using a separate process
    this.childProcess = childProcess.spawn(process.execPath, [
      pinoTeeReq,
      'debug', this.mainLogFile
      // 'info', `${logPath}/info.log`,
      // 'warn', `${logPath}/warn.log`,
      // 'error', `${logPath}/error.log`,
      // 'fatal', `${logPath}/fatal.log`
    ], {
      cwd: process.cwd(),
      env: process.env
    })

    this.logThrough.pipe(this.childProcess.stdin)
  }

  _generateFileName () {
    const d = new Date()
    return [
      d.getFullYear().toString(),
      (d.getMonth() + 1).toString().padStart(2, '0'),
      d.getDate().toString().padStart(2, '0'),
      'T',
      d.getHours().toString().padStart(2, '0'),
      d.getMinutes().toString().padStart(2, '0')
    ].join('')
  }

  child ({ module }) {
    return this.log.child({ module })
  }

  kill () {
    // this.childProcess.kill('SIGINT')
    this.logThrough.end()
  }
}

module.exports = {
  FileLogger
}
