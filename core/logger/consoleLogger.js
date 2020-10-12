const addArguments = function (extra, args) {
  const newArgs = [...extra]
  Object.keys(args).forEach((k) => {
    newArgs.push(args[k])
  })
  return newArgs
}

class ConsoleLogger {
  child ({ module }) {
    return new ChildLogger({ module })
  }

  kill () {
  }
}

module.exports = {
  ConsoleLogger
}

class ChildLogger {
  constructor ({ module }) {
    this.module = module
    this.moduleLabel = `[${module}]`
  }

  trace () {
    console.trace.apply(null, addArguments([this.moduleLabel], arguments))
  }

  debug () {
    console.debug.apply(null, addArguments([this.moduleLabel], arguments))
  }

  info () {
    console.info.apply(null, addArguments([this.moduleLabel], arguments))
  }

  warn () {
    console.warn.apply(null, addArguments([this.moduleLabel], arguments))
  }

  error () {
    console.error.apply(null, addArguments([this.moduleLabel], arguments))
  }

  fatal () {
    console.error.apply(null, addArguments([this.moduleLabel], arguments))
  }
}
