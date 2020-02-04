- callbacks prototypes and returned data
- methods
- special methods (data handler)
- built-in custom validators
- how to add custom validators

utils = { _, file }

DataFieldFactory.addFieldType(fieldType, function(validator, utils) {
    return (value, schema) => {
    }
})

DataFieldFactory.addMessage(key,text)

DataFieldFactory.setAction(fieldType, action, function(data, utils) {
    // allowed: add, remove, get, set, clean
})

- flag inside: validatorChanged = true
