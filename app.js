const readline = require('readline');
const rl = readline.createInterface({
    terminal:true,
    input: process.stdin,
    output: process.stdout,
    prompt: 'OHAI> '
});

rl.prompt();

rl.on('line', (line,b,c,d,e) => {
    console.log(line,b,c,d,e);
    switch (line.trim()) {
        case 'hello':
            console.log('world!');
            break;
        default:
            console.log(`Say what? I might have heard '${line.trim()}'`);
            break;
    }
    rl.prompt();
}).on('close', () => {
    console.log('Have a great day!');
    process.exit(0);
});

//        https://timber.io/blog/creating-a-real-world-cli-app-with-node/
//        https://github.com/substack/minimist