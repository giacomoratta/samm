class SamplesTree {
  constructor (absPath, ST_options, DT_options) {
    this.T = new directoryTree(absPath, DT_options)
  }

  empty () {
    return this.T.empty()
  }

  size () {
    return this.T.fileCount()
  }

  getOriginPath () {
    return this.T.rootPath()
  }

  /**
     * Perform a search by tags.
     * The tag string is formatted with ',' (OR) and '+' (AND).
     * @param tagString
     * @returns { array | null }
     */
  filterByTags (tagString) {
    if (!this.T) return

    const smp_obj = new Samples(this.T.rootPath(), tagString)
    if (smp_obj.error()) return smp_obj

    this.T.walk({
      itemFn: (itemData) => {
        smp_obj.add(new PathInfo(itemData.item) /* {pathInfo} */)
      }
    })
    return smp_obj
  }
}

module.exports = SamplesTree
