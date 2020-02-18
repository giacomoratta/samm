const { DataFieldBuiltInFactory } = require('../dataFieldBuiltIn.factory')
let dfbf

describe('DataFieldBuiltInFactory queue field type', function () {
  beforeAll(function () {
    dfbf = new DataFieldBuiltInFactory()
    dfbf.initFactory()
  })

  it('should throw some errors', function () {
    expect(function () {
      const qq = dfbf.create({
        name: 'queue1',
        schema: {
          type: 'queue',
          max: 'abc'
        }
      })
      qq.value = [1, 2]
    }).toThrow('noMaxAttribute')

    expect(function () {
      const qq = dfbf.create({
        name: 'queue1',
        schema: {
          type: 'queue',
          max: 3
        }
      })
      qq.value = [1, 2]
    }).toThrow('invalidQueueType')

    expect(function () {
      const qq = dfbf.create({
        name: 'queue1',
        schema: {
          type: 'queue',
          max: 3
        }
      })
      qq.value = 'invalid'
    }).toThrow('notAnArray')

    expect(function () {
      const qq = dfbf.create({
        name: 'queue1',
        schema: {
          type: 'queue',
          max: 3,
          queueType: 'FIFO'
        }
      })
      qq.value = [3, 5, 7, 8]
    }).toThrow('arrayMax')
  })

  it('should handle a FIFO queue', function () {
    const qq = dfbf.create({
      name: 'queue1',
      schema: {
        type: 'queue',
        max: 3,
        queueType: 'FIFO'
      }
    })

    qq.fn.push(5)
    qq.fn.push(9)
    expect(qq.valueRef).toMatchObject([5, 9])

    qq.fn.pop()
    expect(qq.valueRef).toMatchObject([9])

    qq.fn.push(3)
    qq.fn.push(4)
    expect(qq.valueRef).toMatchObject([9, 3, 4])

    qq.fn.push(7)
    expect(qq.valueRef).toMatchObject([3, 4, 7])
  })

  it('should handle a LIFO queue', function () {
    const qq = dfbf.create({
      name: 'queue1',
      schema: {
        type: 'queue',
        max: 3,
        queueType: 'LIFO'
      }
    })

    qq.fn.push(5)
    qq.fn.push(9)
    expect(qq.valueRef).toMatchObject([5, 9])

    qq.fn.pop()
    expect(qq.valueRef).toMatchObject([5])

    qq.fn.push(3)
    qq.fn.push(4)
    expect(qq.valueRef).toMatchObject([5, 3, 4])

    qq.fn.push(7)
    expect(qq.valueRef).toMatchObject([5, 3, 7])
  })
})
