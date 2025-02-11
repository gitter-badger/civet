import { config } from './CivetConfig'
const kernel = (function () {
  let instance
  let _isInit = false
  let flag = 0
  let current = config.getCurrentDB()
  function _init(name) {
    const cfg = config.getConfig(true)
    if (cfg.resources.length === 0) return false
    try {
      if (!instance.civetkern.init(cfg, flag, true)) {
        console.info('init fail')
        return false
      }
      // if (!cfg.isDBExist(name)) {
      //   console.info('db not exist')
      //   return false
      // }
      _isInit = true
      console.info(cfg, flag, instance.civetkern)
      return true
    } catch (exception) {
      console.info('init civetkern exception:', exception)
    }
  }
  function _release() {
    instance.civetkern.release()
  }
  try {
    instance = require('civetkern')
    if (process.argv[process.argv.length - 1] === 'renderer') {
      flag = 1
    }
    return function(name) {
      if (current !== undefined && name !== current) {
        _release(current)
      }
      if (!_isInit || name !== current) {
        if (!_init(name)) return null
      }
      return instance.civetkern
    }
  } catch (ex) {
    console.error(ex)
  }
})()

function zipFile(input) {
  const fs = require('fs')
  const inputStream = fs.createReadStream(input)
  const zlib = require('zlib')
  const gz = zlib.createGzip()
  const stream = require('stream')
  stream.pipeline(inputStream, gz, fs.createWriteStream(input + '.gz'), (err) => {
    if (err) {
      console.info('zlib error:', err)
    }
  })
}

global.zipFile = zipFile

export default {
  init: (name) => {
    kernel(name)
  },
  getFilesSnap: (flag) => {
    return kernel().getFilesSnap(flag)
  },
  getFilesInfo: (filesID) => { return kernel().getFilesInfo(filesID) },
  getUnTagFiles: () => { return kernel().getUnTagFiles() },
  getUnClassifyFiles: () => { return kernel().getUnClassifyFiles() },
  getClasses: (parent) => { return kernel().getClasses(parent) },
  getClassDetail: (category) => { return kernel().getClassesInfo(category) },
  getAllTags: () => { return kernel().getAllTags() },
  query: (condition) => { return kernel().query(condition) },
  getTagsOfFiles: (filesID) => { return kernel().getTagsOfFiles({id: filesID}) },
  writeLog: (str) => { kernel.writeLog(str) },
  // 以下接口为可写接口
  generateFilesID: (num) => { return kernel().generateFilesID(num) },
  addFiles: (src) => { return kernel().addFiles(src) },
  addMeta: (filesID, meta) => { return kernel().addMeta({id: filesID, meta: meta}) },
  removeFiles: (filesID) => { kernel().removeFiles(filesID) },
  setTags: (filesID, tags) => { return kernel().setTags({ id: filesID, tag: tags }) },
  removeTags: (filesID, tags) => { return kernel().removeTags({ id: filesID, tag: tags }) },
  addClasses: (sql) => { return kernel().addClasses(sql) },
  removeClasses: (classes) => { return kernel().removeClasses(classes) },
  updateFile: (sql) => { return kernel().updateFile(sql) },
  updateClassName: (classPath, newPath) => { return kernel().updateClassName(classPath, newPath) },
  release: () => {
    kernel().release()
  }
}
