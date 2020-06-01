import fs from 'fs'

function deleteF(path) {
  var files = []
  if (fs.existsSync(path)) {
    if (fs.statSync(path).isDirectory()) {
      files = fs.readdirSync(path)
      for (let file of files) {
        var curPath = path + '/' + file
        if (fs.statSync(curPath).isDirectory()) {
          deleteF(curPath)
        } else {
          fs.unlinkSync(curPath)
        }
      }
      fs.rmdirSync(path)
    } else {
      fs.unlinkSync(path)
    }
  }
}

function copyF(from, to) { // 复制文件夹到指定目录
  let files = []
  if (fs.existsSync(to)) { // 文件是否存在 如果不存在则创建
    files = fs.readdirSync(from)
    for (let file of files) {
      var targetPath = from + '/' + file
      var toPath = to + '/' + file
      if (fs.statSync(targetPath).isDirectory()) { // 复制文件夹
        copyF(targetPath, toPath)
      } else { // 拷贝文件
        fs.copyFileSync(targetPath, toPath)
      }
    }
  } else {
    fs.mkdirSync(to)
    copyF(from, to)
  }
}

export default {
  deleteFolder: deleteF,
  copyFolder: copyF
}
