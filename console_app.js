var scanf = require('scanf');

function x(){
    var name = scanf('%s');
    console.log(name);
}

while(true){
    console.log('Pleas input your name');
    var name = scanf('%S');
    console.log(name);
    x();
}