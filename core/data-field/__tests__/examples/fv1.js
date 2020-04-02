const Validator = require('fastest-validator')
const v = new Validator({
  messages: {
    // Register our new error message text
    evenNumber: "The '{field}' field must be an even number! Actual: {actual}",
    noSchemaAtt1: "The '{field}' field must have the schema att1! Actual: {actual}"
  }
})

v.add('pre-even', function ({ schema, messages } /*, path, context */) {
  return {
    source: `
            if (value % 2 != 0)
                ${this.makeError({ type: 'evenNumber', actual: 'value', messages })}

            return value;
        `
  }
})

// Register a custom 'even' validator
v.add('even', function ({ schema, messages }, path, context) {
  console.log(path)
  console.warn(schema, 'AA')
  if (!schema.attr1 || schema.attr1 === 123) throw new Error('my error')
  return {
    source: `
      console.log(${schema.attr1}, value)
      if (value % 2 != 0)
        ${this.makeError({ type: 'evenNumber', actual: 'value', messages })}
      return value;
    `
  }
})

const schema = {
  name: { type: 'string', min: 3, max: 255 },
  test1: { type: 'array' },
  ages: {
    type: 'array',
    items: { type: 'even', attr1: 1233 }
  }
}

const valFn = v.compile(schema)
v.compile(schema)

console.log(valFn({ name: 'John', test1: '32', ages: [20, 30, 40] }))
// Returns: true

console.log(valFn({ name: 'John', ages: [19, 22, 32] }))
/* Returns an array with errors:
    [{
        type: 'evenNumber',
        expected: null,
        actual: 19,
        field: 'age',
        message: 'The \'age\' field must be an even number! Actual: 19'
    }]
*/
