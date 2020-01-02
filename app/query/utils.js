const _ = require('lodash')

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

const removeEmptyArrayStringItems = function(array) {
  for(let i=array.length-1; i>=0; i--){
    array[i] = array[i].trim()
    if(array[i].length===0) array.splice(i,1)
  }
}

const createQueryStringCheck = function(body) {
  return createFunctionFromBody('s', body)
}

const processQueryString = function (queryString) {
  queryString = queryString.toLowerCase().replace(/[^a-zA-Z0-9+,]/g, '')

  const queryInfo = {
    label: '',
    functionBody: '',
    queryString: '',
    check: null,
    _linesOR: [],
    _functionLinesOR: [],
  }

  /* Split OR conditions */
  const queryOR = _.split(queryString, ',')
  if (!(queryOR instanceof Array) || queryOR.length === 0) return null
  removeEmptyArrayStringItems(queryOR)
  if(queryOR.length === 0) return null

  /* Composing function code */
  queryOR.forEach(function (lineOR, i1, a1) {

    const queryAND = lineOR.split('+')
    removeEmptyArrayStringItems(queryAND)
    if(queryAND.length === 0) return null

    queryInfo._linesOR.push(queryAND.join('+'))
    queryInfo._functionLinesOR.push(`if ( s.indexOf('${queryAND.join('\')>=0 && s.indexOf(\'')}')>=0 ) return true;`)
  })
  queryInfo._functionLinesOR.push(`return false;`)

  queryInfo.queryString = queryInfo._linesOR.join(',')
  if(queryInfo.queryString.length < 2) return null

  queryInfo.functionBody = queryInfo._functionLinesOR.join(' ')
  queryInfo.label = queryInfo.queryString.replace(/[^a-zA-Z0-9]/g, '_').substr(0,36)

  queryInfo.check = createQueryStringCheck(queryInfo.functionBody)

  delete queryInfo._linesOR
  delete queryInfo._functionLinesOR

  return queryInfo
}

module.exports = {
  processQueryString,
  createQueryStringCheck
}
