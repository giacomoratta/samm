const { JsonizedFile } = require('../../core/jsonized-file')
const { SampleInfo } = require('./../sample/sampleInfo.class')
const { BookmarkInfo } = require('./bookmarkInfo.class')

class BookmarksJsonFileClass {
  constructor (filePath) {
    this.jsonFile = new JsonizedFile({ filePath, prettyJson: true })
    this.jsonFile.preProcessRawDataFn = (data) => {
      // foreach
      //    this.jsonFile.ensureField + make it empty (array)
      //    delete if data[field] is empty or not array
      return data
    }
  }

  add(label, SampleInfo) {
    /* todo */
    // check instanceof
    // ensure field with label
  }

  remove(label, SampleInfo) {

  }

  removeByIndex(label, index) {

  }

  removeLabel(label) {

  }

  save() {

  }

  load() {

  }

}
