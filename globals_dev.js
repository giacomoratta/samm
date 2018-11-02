
/* Standard Libraries */
global.d$ = function(){
    let pp = '------------------------------';
    let pre = '';
    let post = ' '+pp+pp;
    let tp = " - "+Date.now()+' ';
    console.log("\n\n"+pre+"< debug"+tp+">"+post);
    console.log.apply(null,arguments);
    console.log(pre+"< END debug"+tp+">"+post+"\n");
}