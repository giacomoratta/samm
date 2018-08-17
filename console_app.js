const vorpal = require('vorpal')();

vorpal
    .command('foo <requiredArg> [optionalArg]')
    .option('-v, --verbose', 'Print foobar instead.')
    .option('-a, --amo-unt <coffee>', 'Number of cups of coffee.')
    .option('-A', 'Does amazing things.', ['Unicorn', 'Narwhal', 'Pixie'])
    .description('Outputs "bar".')
    //.alias('foosball')
    .action(function(args, callback) {
        console.log(args);
        if (args.options.verbose) {
            this.log('foobar');
        } else {
            this.log('bar');
        }
        callback();
    });

vorpal
    .delimiter('mpl$')
    .show();