const { compile } = require('nexe')
const packageJson = require('./package.json')
const _ = require('lodash')
const Utils = {}

const b$cfg = {
  version: packageJson.version,
  build_dir: Utils.File.setAsAbsPath('build'),
  compile_options: {
    input: './app-prod.js',
    output: null, // './build/y',
    verbose: true
  },
  platforms: {
    /*
        * key: only [a-z\_]
        * _ will be replaced with . to create a signature
        */
    mac_x64: {
      tqueries_sample: Utils.File.setAsAbsPath('tqueries.sample.json', true),
      compile_options: {
        target: 'mac-x64-10.13.0'
      }
    },
    win_x64: {
      tqueries_sample: Utils.File.setAsAbsPath('tqueries.sample.json', true),
      compile_options: {
        target: 'windows-x64-10.13.0'
      }
    },
    win_x86: {
      tqueries_sample: Utils.File.setAsAbsPath('tqueries.sample.json', true),
      compile_options: {
        target: 'windows-x86-10.13.0'
      }
    },
    linux_x64: {
      tqueries_sample: Utils.File.setAsAbsPath('tqueries.sample.json', true),
      compile_options: {
        target: 'linux-x64-10.13.0'
      }
    },
    linux_x86: {
      tqueries_sample: Utils.File.setAsAbsPath('tqueries.sample.json', true),
      compile_options: {
        target: 'linux-x86-10.13.0'
      }
    }
  }

}

console.log('\n' + 'MPL :: Build :: Start')

console.log('\n' + 'Create directory for build ::', b$cfg.build_dir)
Utils.File.ensureDirSync(b$cfg.build_dir)

const compileForPlatform = function (platform) {
  if (!b$cfg.platforms[platform]) return false
  const poz = b$cfg.platforms[platform]

  poz.signature = platform.replace(/[_]/g, '.').replace(/[^a-zA-Z0-9.]/g, '')
  poz.signature = 'mpl.' + b$cfg.version + '.' + poz.signature

  poz.compile_options = _.merge(b$cfg.compile_options, poz.compile_options)

  poz.build_dir = Utils.File.pathJoin(b$cfg.build_dir, poz.signature)
  poz.compile_options.output = Utils.File.pathJoin(poz.build_dir, 'mpl')
  poz.tqueries_final = Utils.File.pathJoin(poz.build_dir, 'tqueries.json')

  console.log('\n' + '[' + platform + '] Delete directory for build ::', poz.build_dir)
  Utils.File.removeDirSync(poz.build_dir)

  console.log('\n' + '[' + platform + '] Create directory for build ::', poz.build_dir)
  Utils.File.ensureDirSync(poz.build_dir)

  console.log('\n' + '[' + platform + '] Copying sample tquery file ::', poz.tqueries_final)
  Utils.File.copyFileSync(poz.tqueries_sample, poz.tqueries_final)

  console.log(poz.compile_options)

  return compile(poz.compile_options).then(() => {
    console.log('\n' + '[' + platform + '] Build complete ::', poz.compile_options.output, '\n')
    // TODO: create zip
  }).catch(() => {
    console.log('\n' + '[' + platform + '] Build failed ::', poz.compile_options.output, '\n')
  })
}

const platformsToBuildFor = [
  // 'mac_x64',
  'win_x64'
  // 'win_x86',
  // 'linux_x64',
  // 'linux_x86'
]

if (platformsToBuildFor.length > 0) {
  const _recursivePromise = function (a, i) {
    return compileForPlatform(a[i]).then(() => {
      if (i >= a.length - 1) {
        console.log('\n' + 'MPL :: Build :: Finished', '\n\n')
      } else {
        return _recursivePromise(a, i + 1)
      }
    }).catch((e) => {
      console.error('\n' + 'MPL :: Build :: Error', e, '\n\n')
    })
  }
  _recursivePromise(platformsToBuildFor, 0)
}

// Utils.EXIT();

/*
* compile for mac.x64
* compile for win.x86
* compile for win.x64
* compile for linux.x86
* compile for linux.x64
* make zip files and delete original directories
* */
//
// compile({
//     input: './app-prod.js',
//     output: './build/y',
//     verbose:true
// }).then(() => {
//     console.log('success')
// });
