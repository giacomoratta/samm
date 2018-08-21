//let SmpClass = require('../libs/Samples.class.js');

class MyClass {
    constructor(l){
        this.l = l;
    }

    newObj(l){
        return new this.constructor(l);
    }
}


let x = new MyClass('a');
let y = x.newObj('b');

console.log(x.l);
console.log(y.l);
x.l='c';
console.log(x.l);
console.log(y.l);