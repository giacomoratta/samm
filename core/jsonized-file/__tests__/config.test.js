
/*
* add simple fields
* add complex fields
* add absPath fields
*
* edit simple fields
* edit complex fields
* edit complex fields by cli (? ...maybe not)
* edit absPath fields
*
* load config file
* save config file
*
* set flags from outside
* set flags (in 'on' method of a field)
* check flags
* print flags
*
* handle paths fields error (with cli)
*   - simulate initialisation
*   - errors during initialisation
*   - exists or replace?
*   - sanitize automatically ==> add relPath fields (with basePath option?)
*
*
*
* */

describe('config class and object', function() {

    it("should create an basic configuration", function() {
        const myConfig = new Config()

        //expect(myConfig.isValid()).toEqual(false)
    })

})
