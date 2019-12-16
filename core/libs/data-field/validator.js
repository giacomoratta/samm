const fastestValidator = require('fastest-validator')

const validator = new fastestValidator({
    messages: {
        // Register our new error message text
        notPath: `The '{field}' field must be an even number! Actual: {actual}`,
        pathNotExists: `The '{field}' field must be an even number! Actual: {actual}`,
        notRelDirPath: `The '{field}' field must be an even number! Actual: {actual}`,
        notRelFilePath: `The '{field}' field must be an even number! Actual: {actual}`,
        notAbsDirPath: `The '{field}' field must be an even number! Actual: {actual}`,
        notAbsFilePath: `The '{field}' field must be an even number! Actual: {actual}`,
    }
})

// todo
// get extra field parameter
// add extra filter 'checkExist'
// path = string + path.resolve + path.validate + (opx) path.exists


validator.add("relDirPath", (value, schema) => {
    if (false) {
        return validator.makeError('notPath', null, value)
    }
    if (false) {
        return validator.makeError('notRelDirPath', null, value)
    }
    if (false) {
        return validator.makeError('pathNotExists', null, value)
    }
    return true
})


validator.add("relFilePath", (value, schema) => {
    if (false) {
        return validator.makeError('notPath', null, value)
    }
    if (false) {
        return validator.makeError('notRelFilePath', null, value)
    }
    if (false) {
        return validator.makeError('pathNotExists', null, value)
    }
    return true
})


validator.add("absDirPath", (value, schema) => {
    if (false) {
        return validator.makeError('notPath', null, value)
    }
    if (false) {
        return validator.makeError('notAbsDirPath', null, value)
    }
    if (false) {
        return validator.makeError('pathNotExists', null, value)
    }
    return true
})


validator.add("absFilePath", (value, schema) => {
    if (false) {
        return validator.makeError('notPath', null, value)
    }
    if (false) {
        return validator.makeError('notAbsFilePath', null, value)
    }
    if (false) {
        return validator.makeError('pathNotExists', null, value)
    }
    return true
})

module.exports = validator
