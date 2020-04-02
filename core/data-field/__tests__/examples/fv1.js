const Validator = require('fastest-validator')
const v = new Validator({
  messages: {
    // Register our new error message text
    evenNumber: "The '{field}' field must be an even number! Actual: {actual}",
    noSchemaAtt1: "The '{field}' field must have the schema att1! Actual: {actual}"
  }
})

v.add('pre-even', function ({ schema, messages }, path, context) {
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
  return {
    source: `
      if (value % 2 != 0)
        ${this.makeError({ type: 'evenNumber', actual: 'value', messages })}
      return value;
    `
  }
})

const schema = {
  name: { type: 'string', min: 3, max: 255 },
  age: { type: 'even' }
}

console.log(v.validate({ name: 'John', age: 20 }, schema))
// Returns: true

console.log(v.validate({ name: 'John', age: 19 }, schema))
/* Returns an array with errors:
    [{
        type: 'evenNumber',
        expected: null,
        actual: 19,
        field: 'age',
        message: 'The \'age\' field must be an even number! Actual: 19'
    }]
*/
