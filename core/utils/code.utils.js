const libUtils = {}

function F (args) {
  return Function.apply(this, args)
}

libUtils.createFunction = function () {
  try {
    F.prototype = Function.prototype
    return new F(arguments)
  } catch (e) {
    console.error(e)
    return null
  }
}

module.exports = libUtils
