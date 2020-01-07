const { _ } = require('./lodash.extended')
const libUtils = {}

const regexp = {
  url_domain: /^(?:https?:)?(?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im
  /*  'http://abc.ggg.com/kjhsf?fdklsjd'.match(rg)
        [
            'http://abc.ggg.com',
            'abc.ggg.com',
            index: 0,
            input: 'http://abc.ggg.com/kjhsf?fdklsjd'
        ]
    */
}

libUtils.replaceAll = (str, str1, str2, ignore) => {
  // return str.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, '\\$&'), (ignore ? 'gi' : 'g')), (typeof (str2) === 'string') ? str2.replace(/\$/g, '$$$$') : str2)
  return str.replace(new RegExp(str1.replace(/([/,!\\^${}[\]().*+?|<>\-&])/g, '\\$&'), (ignore ? 'gi' : 'g')), (typeof (str2) === 'string') ? str2.replace(/\$/g, '$$$$') : str2)
}

libUtils.fileSizeToStr = (fileSize) => {
  if (fileSize < 1024) return fileSize + ' B'
  if (fileSize < 1048576) return Math.round(fileSize / 1024) + ' KB'
  if (fileSize < 1073741824) return Math.round(fileSize / 1048576) + ' MB'
  if (fileSize < 1099511627776) return Math.round(fileSize / 1073741824) + ' GB'
  return Math.round(fileSize / (1099511627776)) + ' TB'
}

libUtils.cutByPreservingWords = (v, max) => {
  if (v.length < max) return v
  const i = this.php_stripos(v, ' ', max * (-1))
  if (i === false) return v
  return v.substr(0, i + 1)
}

libUtils.onlyValidURL = (s) => {
  return _.deburr(s).replace(/[^a-zA-Z0-9 ]/g, '')
}

libUtils.onlyLettersNumbers = (s) => {
  return _.deburr(s).replace(/[^a-zA-Z0-9]/g, '')
}

libUtils.onlyValidPathName = (s) => {
  return _.deburr(s).replace(/[^a-zA-Z0-9_\-.]/g, '')
}

libUtils.html_query_string = (v, joinch) => {
  // TODO handle special characters
  const pph = v.indexOf('('); if (pph > 0) v = v.substr(0, pph - 1)
  v = this.onlyValidURL(v)
  return _.trim(v).split(' ').splice(0, 2).join(joinch)
}

libUtils.php_stripos = (fHaystack, fNeedle, fOffset) => {
  //  discuss at: http://locutus.io/php/stripos/
  const haystack = (fHaystack + '').toLowerCase()
  const needle = (fNeedle + '').toLowerCase()
  let index = 0
  if (fOffset < 0) {
    fOffset *= -1
    if ((index = (haystack + '').substr(0, fOffset).lastIndexOf(needle)) !== -1) {
      return index
    }
  } else {
    if ((index = haystack.indexOf(needle, fOffset)) !== -1) {
      return index
    }
  }
  return false
}

libUtils.php_strripos = (haystack, needle, offset) => {
  //  discuss at: http://locutus.io/php/strripos/
  haystack = (haystack + '').toLowerCase()
  needle = (needle + '').toLowerCase()
  let i = -1
  if (offset) {
    i = (haystack + '')
      .slice(offset)
      .lastIndexOf(needle)
    // strrpos' offset indicates starting point of range till end,
    // while lastIndexOf's optional 2nd argument indicates ending point of range from the beginning
    if (i !== -1) {
      i += offset
    }
  } else {
    i = (haystack + '')
      .lastIndexOf(needle)
  }
  return i >= 0 ? i : false
}

libUtils.strToInteger = (s) => {
  if (!_.isString(s)) return null
  s = _.trim(s)
  if (s.length <= 0) return null
  const n = parseInt(s)
  if (_.isNil(n) || _.isNaN(n) || '' + n + '' !== s) return null
  return n
}

libUtils.strToFloat = (s) => {
  if (!_.isString(s)) return null
  s = _.trim(s)
  if (s.length <= 0) return null
  const n = parseFloat(s)
  if (_.isNil(n) || _.isNaN(n) || '' + n + '' !== s) return null
  return n
}

libUtils.strToBoolean = (s) => {
  s = _.trim(s)
  if (s.length <= 0) return null
  s = _.toLower(s)
  let n = null
  if (s === 'true' || s === '1' || s === 'y') n = true
  if (s === 'false' || s === '0' || s === 'n') n = false
  return n
}

libUtils.strToString = (s) => {
  if (!_.isString(s)) return null
  s = _.trim(s)
  if (s.length <= 0) return null
  return s
}

libUtils.getSitename = (url) => {
  const urlPieces = url.match(regexp.url_domain)
  if (urlPieces.length < 2) return ''
  const lastDot = urlPieces[1].lastIndexOf('.')
  if (lastDot > 0) {
    urlPieces[1] = urlPieces[1].substr(0, lastDot)
  }
  urlPieces[1] = _.upperFirst(urlPieces[1])
  return urlPieces[1]
}

module.exports = {
  stringUtils: libUtils
}
