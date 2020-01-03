const Validator = require('fastest-validator')

const v = new Validator()

const schema1 = {
  id: { type: 'number', positive: true, integer: true },
  name: { type: 'string', min: 3, max: 255 },
  status: 'boolean', // short-hand def
  $$strict: false
}

const check1 = v.compile(schema1)

console.log(check1({ id: 5, name: 'John', status: true, extra: false }))

const schema2 = {
  fieldname1: {
    type: 'object',
    props: {
      id: { type: 'number', positive: true, integer: true },
      name: { type: 'string', min: 3, max: 255 },
      status: 'boolean',
      nested: {
        type: 'object',
        props: {
          id: { type: 'number', positive: true, integer: true },
          name: { type: 'string', min: 3, max: 255 },
          status: 'boolean',
          listing: { type: 'array' }
        }
      },
      $$strict: true
    }
  }
}

const check2 = v.compile(schema2)

console.log(check2({
  fieldname1: {
    id: 32,
    name: 'abcde12345',
    status: true,
    nested: {
      id: 42,
      name: 'fghil67890',
      status: false,
      listing: [
        'elm1',
        'elm2'
      ]
    },
    extra: 'abc'
  }
}))
