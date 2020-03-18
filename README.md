### Install

```bash
git submodule update --init --recursive
npm i
```

### Development

### Working environment

##### Jest: auto-completion and avoid warnings
In Preferences | Languages & Frameworks | JavaScript | Libraries, press Download..., select 'jest' from the list of available stubs, press Download and Install.
At the end, a new library named `@types/jest` is added to the list. 


#### Run tests
```bash
npm test
```

Run one single:
```bash
cd ./modules/__tests__/ 
npm test -- configClass.test.js
```
