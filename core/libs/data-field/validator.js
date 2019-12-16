const fastestValidator = require('fastest-validator')

const validator = new fastestValidator({
    messages: {
        // Register our new error message text
        evenNumber: "The '{field}' field must be an even number! Actual: {actual}"
    }
})

// Register a custom 'even' validator
validator.add("even", value => {
    if (value % 2 !== 0)
        return validator.makeError("evenNumber", null, value);

    return true;
})

module.exports = validator
