const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

let thirdModules = null
function init(plgDir) {
  let modules = {}

  function loadModule(moduleName, directory) {
    try {
      const mainfest = directory + '/mainfest.json'
      const mf = require(mainfest)
      const background = mf['background']
      if (background && background['script']) {
        const child = spawn(process.execPath, [background['script'][0], 'args'], {
          stdio: 'pipe'
        })
        const actions = background.action
        for (let action in actions) {
          child.on(action, require(actions[action]))
        }
      }
      console.info('load plugin: ', moduleName)
    } catch (err) {
      console.error(err)
    }
  }

  const plguins = fs.readdirSync(plgDir)
  for (let filename of plguins) {
    const fullpath = path.join(plgDir, filename)
    const stat = fs.statSync(fullpath)
    if (!stat.isDirectory()) {
      if (path.exist(fullpath + '/mainfest.json')) {
        loadModule(filename, fullpath)
      }
    }
    return modules
  }
}

function load() {
  if (thirdModules === null) {
    const app = require('electron')
    const root = app.getAppPath()
    console.info('plugin dir:', root)
    thirdModules = init(root + 'plugins')
  }
  return thirdModules
}
export default {
  load: load,
  getModuleByExt: (ext) => {
    load()
    for (let module of thirdModules) {
      if (module['type'] === 'file' && module['ext'].indexOf(ext) > -1) {
        return module
      }
    }
    return null
  }
}