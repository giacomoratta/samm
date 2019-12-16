const fastestValidator = require('fastest-validator')

const validator = new fastestValidator({
    messages: {
        // Register our new error message text
        evenNumber: "The '{field}' field must be an even number! Actual: {actual}"
    }
});

module.exports = validator
