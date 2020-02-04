- callbacks prototypes and returned data
- methods
- special methods (data handler)
- built-in custom validators
- how to add custom validators

utils = { _, file }

DataFieldFactory.define(fieldType, function(validator, utils) {
    return {
        validate: (value, schema) => { },
        add: (field) => { },
        remove: (field) => { },
        clean: (field) => { },
        get: (value) => { },
        set: (value) => { },
    }
})

DataFieldFactory.message(key,text)

DataFieldFactory._getValidator()
- flag inside: validatorChanged = true
