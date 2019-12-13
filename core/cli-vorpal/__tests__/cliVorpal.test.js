const cliVorpal = new (require('../cliVorpal.class'))()

describe('cli interface with vorpal library', function() {

    it("should add a command", function() {
        expect(cliVorpal.addCommand('cmdname1 <action> [query]')).toEqual('cmdname1')
        expect(cliVorpal.addCommand('cmdname2 ')).toEqual('cmdname2')

        expect(cliVorpal.addCommandHeader('cmdname2')).toHaveProperty('description')
        expect(cliVorpal.addCommandHeader('cmdname2')).toHaveProperty('option')

        cliVorpal.addCommandHeader('cmdname2')
            .description("Prints the samples collection" + '\n')
            .option('-a, --all', 'Shows all the bookmarks')
            .option('-l, --lookup', 'Shows the latest lookup')
            .option('-t, --tag <tag>', 'Shows the bookmarks under the specified custom tag')
            .option('-s, --save', 'Save bookmarks in the current project')
    })


    it("should set listener on events", function() {

        expect(cliVorpal.on('show',()=>{
            /* callback code */
        })).toEqual(true)

        expect(cliVorpal.on('exit',()=>{
            /* callback code */
        })).toEqual(true)

        expect(cliVorpal.on('beforeNext',()=>{
            /* callback code */
        })).toEqual(true)

        expect(cliVorpal.on('show-wrong',()=>{
            /* callback code */
        })).toEqual(false)
    })


    it("should set a custom logger", function() {

        expect(cliVorpal.setLogger({
            debug: ()=>{},
            info: ()=>{},
            warn: ()=>{},
            error: ()=>{},
            extra: ()=>{}
        })).toEqual(true)

        expect(cliVorpal.setLogger({
            debug: ()=>{},
            info: ()=>{},
            warn: ()=>{},
        })).toEqual(false)
    })

})
