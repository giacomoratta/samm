const Validator = require("fastest-validator");

const v = new Validator();

const schema1 = {
    id: { type: "number", positive: true, integer: true },
    name: { type: "string", min: 3, max: 255 },
    status: "boolean" // short-hand def
};

const check1 = v.compile(schema1);

console.log(check1({ id: 5, name: "John", status: true }));



const schema1 = {
    id: { type: "number", positive: true, integer: true },
    name: { type: "string", min: 3, max: 255 },
    status: "boolean" // short-hand def
};

const check1 = v.compile(schema1);

console.log(check1({ id: 5, name: "John", status: true }));
