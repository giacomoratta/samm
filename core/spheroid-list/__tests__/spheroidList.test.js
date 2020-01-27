const { SpheroidList } = require('../spheroidList.class')
const maxCacheItems = 3

describe('SpheroidList standard features', function () {
  it('Should add and remove 4 unlabeled elements', function () {
    const list1 = new SpheroidList({ maxSize: maxCacheItems })
    expect(list1.latest).toEqual(undefined)
    expect(list1.oldest).toEqual(undefined)
    list1.add('e1')
    list1.add('e2')
    list1.add('e3')
    list1.add('e4')
    expect(list1.size).toEqual(3)
    expect(list1.latest).toEqual('e4')
    expect(list1.oldest).toEqual('e2')
    expect(list1.remove()).toEqual(true)
    expect(list1.remove()).toEqual(true)
    expect(list1.remove()).toEqual(true)
    expect(list1.remove()).toEqual(false)
    expect(list1.size).toEqual(0)
  })

  it('Should add and remove 4 labeled elements', function () {
    const list1 = new SpheroidList({ maxSize: maxCacheItems })
    list1.add('e1', 111)
    list1.add('e2', 222)
    list1.add('e3', 333)
    list1.add('e4', 444)
    expect(list1.size).toEqual(3)
    expect(list1.get('e1')).toEqual(undefined)
    expect(list1.get('e2')).toEqual(222)
    expect(list1.get('e3')).toEqual(333)
    expect(list1.get('e4')).toEqual(444)
    expect(list1.remove('e1')).toEqual(false)
    expect(list1.remove('e2')).toEqual(true)
    expect(list1.remove('e3')).toEqual(true)
    expect(list1.remove('e4')).toEqual(true)
    expect(list1.size).toEqual(0)
  })

  it('Should use mixed elements', function () {
    const list1 = new SpheroidList({ maxSize: maxCacheItems })
    list1.add('e1', 111)
    list1.add('e2', 222)
    list1.add('e3')
    list1.add('e4')
    expect(list1.has('e1')).toEqual(false)
    expect(list1.has('e2')).toEqual(true)
    expect(list1.has('e3')).toEqual(false)
    expect(list1.get('e2')).toEqual(222)
    expect(list1.oldest).toEqual(222)
    expect(list1.latest).toEqual('e4')
    expect(list1.remove()).toEqual(true)
    expect(list1.remove()).toEqual(true)
    expect(list1.remove()).toEqual(true)
    expect(list1.remove()).toEqual(false)
    expect(list1.size).toEqual(0)
  })

  it('Should throw some errors', function () {
    expect(function () {
      const list1 = new SpheroidList({ maxSize: -32 })
    }).toThrow('maxSize')

    expect(function () {
      const list1 = new SpheroidList({ maxSize: 3.2 })
    }).toThrow('maxSize')

    expect(function () {
      const list1 = new SpheroidList({ maxSize: 'abc' })
    }).toThrow('maxSize')

    expect(function () {
      const list1 = new SpheroidList({ maxSize: maxCacheItems })
      list1.add(23)
      list1.add(23)
      list1.add('label1', 123)
      list1.add('label1', 345)
    }).toThrow('label1')
  })
})
