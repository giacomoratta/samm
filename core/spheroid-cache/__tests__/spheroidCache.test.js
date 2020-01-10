const { SpheroidCache } = require('../spheroidCache.class')
const maxCacheItems = 3

describe('SpheroidCache standard features', function () {
  it('Should add, change and delete items', function () {
    const cache1 = new SpheroidCache({ maxSize: maxCacheItems })
    expect(cache1.size).toEqual(0)

    expect(cache1.add('lb1', 123)).toEqual(true)
    expect(cache1.size).toEqual(1)

    expect(cache1.add('lb2', 456)).toEqual(true)
    expect(function () {
      cache1.add('lb2', 111)
    }).toThrow('Duplicated')
    expect(cache1.size).toEqual(2)

    expect(cache1.add('lb3', 789)).toEqual(true)
    expect(cache1.size).toEqual(3)

    expect(cache1.add('lb4', 234)).toEqual(true)
    expect(cache1.size).toEqual(3)

    expect(cache1.get('lb1')).toEqual(undefined)

    expect(cache1.remove('lb3')).toEqual(true)
    expect(cache1.size).toEqual(2)

    expect(cache1.get('lb2')).toEqual(456)
    expect(cache1.remove()).toEqual(true)
    expect(cache1.size).toEqual(1)
    expect(cache1.get('lb2')).toEqual(undefined)

    expect(cache1.add(575)).toEqual(true)
    expect(cache1.size).toEqual(2)

    expect(cache1.add(686)).toEqual(true)
    expect(cache1.size).toEqual(3)

    expect(cache1.add('lb5', 797)).toEqual(true)
    expect(cache1.size).toEqual(3)

    expect(cache1.get(0)).toEqual(797)
    expect(cache1.get('lb5')).toEqual(797)
    expect(cache1.get(1)).toEqual(686)
    expect(cache1.get(2)).toEqual(575)
    expect(cache1.get(3)).toEqual(undefined)
    expect(cache1.get('qwerty')).toEqual(undefined)
  })

  it('Should have typical FIFO features', function () {
    const cache1 = new SpheroidCache({ maxSize: maxCacheItems })

    expect(cache1.add(575)).toEqual(true)
    expect(cache1.add(686)).toEqual(true)
    expect(cache1.add('lb5', 797)).toEqual(true)

    expect(cache1.latest).toEqual(797)
    expect(cache1.oldest).toEqual(575)

    expect(cache1.remove()).toEqual(true)
    expect(cache1.latest).toEqual(797)
    expect(cache1.oldest).toEqual(686)

    expect(cache1.remove()).toEqual(true)
    expect(cache1.latest).toEqual(797)
    expect(cache1.oldest).toEqual(797)

    expect(cache1.remove()).toEqual(true)
    expect(cache1.latest).toEqual(undefined)
    expect(cache1.oldest).toEqual(undefined)

    expect(cache1.remove()).toEqual(false)
    expect(cache1.latest).toEqual(undefined)
    expect(cache1.oldest).toEqual(undefined)
  })
})
