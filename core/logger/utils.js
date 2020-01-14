const path = require('path')
const { fileUtils } = require('../utils/file.utils')

// todo: getFilePathFromPool [ filePath:'', suffixFn: (name,index)=>{ return name+index }, poolSize:3, maxFileSize:1024*1024*2 ]

const getLogFilePath = (fileName) => {
  const parsedFile = path.parse(fileName)
  let file1 = path.join(parsedFile.dir, parsedFile.name + '_1' + parsedFile.ext)
  let file2 = path.join(parsedFile.dir, parsedFile.name + '_2' + parsedFile.ext)

  const file1Stats = fileUtils.getPathStatsSync(file1)
  const file2Stats = fileUtils.getPathStatsSync(file2)

  if (file1Stats && file2Stats) {
    if (file1Stats.birthtimeMs > file2Stats.birthtimeMs) {
      const temp = file1
      file1 = file2
      file2 = temp
    }
  }

  if (fileUtils.fileExistsSync(file2) === true) {
    fileUtils.removeFileSync(file1)
    fileUtils.copyFileSync(file2, file1)
    fileUtils.removeFileSync(file2)
    return file1
  }
  if (fileUtils.fileExistsSync(file1) === true) {
    return file2
  }
  return file1
}

module.exports = {
  getLogFilePath
}
