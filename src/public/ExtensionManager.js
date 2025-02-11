// const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

function init(plgDir) {
  const modules = {}

  function loadModule() {
    try {
      const extensionPath = installPath()
      const extensions = fs.readdirSync(extensionPath)
      for (const extensionID of extensions) {
        if (Object.prototype.hasOwnProperty.call(modules, extensionID)) continue
        // const fullpath = path.join(extensionPath, extensionID)
        // const pkg = fullpath + '/package.json'
        // const config = require(pkg)
        // modules[extensionID] = config
      }
    } catch (err) {
      console.error(err)
    }
  }

  loadModule()
  return modules
}

function load() {
  return init()
}

function unzip(filepath) {}

function installPath() {
  const os = require('os')
  const platform = os.platform()
  // const app = require('./System').default.app()
  // const userDir = app.getPath('userData')
  switch (platform) {
    case 'win32':
      break
    case 'mac':
      break
    default:
      break
  }
  console.info(__dirname)
  let extensionPath
  if (process.env.NODE_ENV === 'development') {
    extensionPath = path.join(__dirname, '../worker/service')
  } else {
    extensionPath = path.join(__dirname, '/resources/extension')
  }
  // TODO: recursive create path
  if (!fs.existsSync(extensionPath)) {
    fs.mkdirSync(extensionPath)
  }
  console.info('extension path:', extensionPath)
  return extensionPath
}

function install(extension) {
  //
  const instPath = installPath()
  console.info(instPath)
}
export default {
  unzip: unzip,
  install: install,
  uninstall: null,
  load: load,
  getModuleByExt: (ext) => {
    load()
    // for (let module of thirdModules) {
    //   if (module['type'] === 'file' && module['ext'].indexOf(ext) > -1) {
    //     return module
    //   }
    // }
    const lext = ext.toLowerCase()
    console.info(lext)
    if (lext === 'jpg' || lext === 'jpeg' || lext === 'bmp' || lext === 'tiff' || lext === 'png' ||
      lext === 'webp' || lext === 'tif' || lext === 'heic') return true
    return null
  }
}
