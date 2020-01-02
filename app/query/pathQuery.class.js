
function F (args) {
  return Function.apply(this, args)
}

createFunctionFromBody = function () {
  try {
    F.prototype = Function.prototype
    return new F(arguments)
  } catch (e) {
    //console.error(e)
    return null
  }
}

class PathQuery {
  constructor () {
    this._label = null
    this._functionBody = null
    this._queryString = null
    this.check = null
  }

  get label() { return this._label }
  set label(label) { this._label = label }

  get queryString() { return this._queryString }
  set queryString(queryString) { this._queryString = queryString }

  set check(functionBody) {
    this._functionBody = functionBody
    this.check = createFunctionFromBody('s', this._functionBody)
  }

  clone() {

  }

  fromJson(jsonData) {

  }

  toJson() {

  }
}

module.exports = {
  PathQuery
}
