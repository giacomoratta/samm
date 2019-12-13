const { cliPrinter } = require('../cliPrinter.class')

describe('cliPrinter class and object', function() {

    it("should create an empty cliInput", function() {
        const cliP1 = new cliPrinter({ command: 'mycmd1'})

        cliP1.info('ciao info');
        cliP1.warn('ciao warn');
        cliP1.error('ciao error');


        const cliP2 = new cliPrinter({ command: 'mycmd2'})

        cliP2.info('ciao info');
        cliP2.warn('ciao warn');
        cliP2.error('ciao error');

        //expect(cliInput1.isValid()).toEqual(false)
    })

})
