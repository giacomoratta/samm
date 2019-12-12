class cliPrinter {
  constructor (options, _sk) {
    if (_sk !== true) {
      options = _.merge({
        printFn: console.log,
        warningFn: console.warn,
        errorFn: console.error,
        debugFn: function () {
          const vv = Object.values(arguments)
          vv.unshift('[DEBUG]')
          vv.push('\n')
          console.log.apply(null, vv)
        },
        debugTimedFn: function () {
          const pp = '------------------------------'
          const pre = ''
          const post = ' ' + pp + pp
          const tp = ' - ' + Date.now() + ' '
          console.log('\n\n' + pre + '< debug' + tp + '>' + post)
          console.log.apply(null, arguments)
          console.log(pre + '< END debug' + tp + '>' + post + '\n')
        },
        prefix: null
      }, options)
    }
    this.options = options
    this._newInstance(this.options)
  }

  newLocalUI (prefix) {
    const opt = _.merge(this.options, {})
    opt.prefix = prefix
    return new this.constructor(opt, true)
  }

  _newInstance (options) {
    this.debug = options.debugFn
    this.debugTimed = options.debugTimedFn

    if (!options.prefix) {
      this.print = options.printFn
      this.warning = options.warningFn
      this.error = options.errorFn
    } else {
      this.print = function () {
        options.printFn.apply(null, this.__addPrefix(options.prefix, arguments))
      }
      this.warning = function () {
        options.warningFn.apply(null, this.__addPrefix(options.prefix, arguments))
      }
      this.error = function () {
        options.errorFn.apply(null, this.__addPrefix(options.prefix, arguments))
      }
    }
  }

  __addPrefix (prefix, args) {
    const vv = Object.values(args)
    vv.unshift(prefix)
    return vv
  }
}

module.exports = cliPrinter
