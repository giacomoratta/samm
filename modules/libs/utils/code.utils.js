const libUtils = {}

function F (args) {
  return Function.apply(this, args)
}

libUtils.newFunction = () => {
  try {
    F.prototype = Function.prototype
    return new F(arguments)
  } catch (e) {
    console.error(e)
    return null
  }
}

module.exports = libUtils
