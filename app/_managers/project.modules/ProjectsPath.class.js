class ProjectsPath {
  constructor () {
  }

  printIndexedList (ppath, printFn) {
    printFn('')
    printFn('Available parent folders:')
    if (!_.isString(ppath) || ppath.length < 1) return
    const array = ppath.split(Utils.File.pathSeparator)
    if (array.length < 1) return
    const new_array = []
    let _new_path = ''
    let _index = 1
    array.forEach((v, i) => {
      v = _.trim(v)
      if (v.length < 1 && _index > 1) return
      v += Utils.File.pathSeparator
      _new_path = Utils.File.pathJoin(_new_path, v)
      new_array.push(_new_path)
      printFn(_.padStart(_index + ')', 4) + ' ' + _new_path)
      _index++
    })
    printFn('')
    return new_array
  }
}

module.exports = ProjectsPath
