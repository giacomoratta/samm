const path = require('path')
const fsExtra = require('fs-extra')
const { compile } = require('nexe')
const packageJson = require('./package.json')

const options = {
  appName: 'samm'
}

const nexeCommon = {
  version: packageJson.version,
  build_dir: path.join(__dirname, 'releases'),
  compile_options: {
    input: './app-build.js',
    output: null,
    verbose: true
  },
  platforms: {
    'mac-x64': {
      compile_options: {
        target: 'mac-x64-12.16.2'
      }
    },
    'win-x64': {
      compile_options: {
        target: 'windows-x64-12.16.2'
      }
    },
    'win-x86': {
      compile_options: {
        target: 'windows-x86-12.16.2'
      }
    },
    'linux-x64': {
      compile_options: {
        target: 'linux-x64-12.16.2'
      }
    },
    'linux-x86': {
      compile_options: {
        target: 'linux-x86-12.16.2'
      }
    }
  }

}

const compileForPlatform = async (platform) => {
  console.log('\n', 'Building app for', platform)
  if (!nexeCommon.platforms[platform]) return false

  const nexePlatform = nexeCommon.platforms[platform]
  nexePlatform.signature = `${options.appName}.${nexeCommon.version}.${platform}`
  nexePlatform.compile_options = { ...nexeCommon.compile_options, ...nexePlatform.compile_options }
  nexePlatform.build_dir = path.join(nexeCommon.build_dir, nexePlatform.signature)
  nexePlatform.compile_options.output = path.join(nexePlatform.build_dir, options.appName)
  console.log(nexePlatform.compile_options)

  try {
    await fsExtra.ensureDir(nexePlatform.build_dir)
  } catch (e) {
    console.error(' > error while ensure directory', nexePlatform.build_dir)
    console.error(e)
    return false
  }

  try {
    await compile(nexePlatform.compile_options)
    console.log(` [ ${platform} ] Build completed :: ${nexePlatform.compile_options.output}`)
  } catch (e) {
    console.log(` [ ${platform} ] Build failed :: ${nexePlatform.compile_options.output}`)
    return false
  }
  return true
}

const platformsToBuildFor = [
  'mac-x64',
  'win-x64',
  'win-x86',
  'linux-x64',
  'linux-x86'
]

const compileAllPlatforms = async () => {
  console.log('SAMM :: Build :: Start')
  try {
    await fsExtra.ensureDir(nexeCommon.build_dir)
  } catch (e) {
    console.error(' > error while ensure directory', nexeCommon.build_dir)
    console.error(e)
    return false
  }

  let platformsArray = null
  if (process.argv[2] === 'all') {
    platformsArray = platformsToBuildFor
  } else {
    if (platformsToBuildFor.indexOf(process.argv[2]) === -1) {
      throw new Error(`Invalid platform: ${process.argv[2]}`)
    }
    platformsArray = [process.argv[2]]
  }

  for (let i = 0; i < platformsArray.length; i++) {
    await compileForPlatform(platformsArray[i])
  }
}

console.log(process.argv)

compileAllPlatforms().then(() => {
  console.log('\nSAMM :: Build :: Finished', '\n')
}).catch(e => {
  console.error('\nSAMM :: Build :: Error', e.message)
  console.error(e, '\n')
})
