const fs = require('fs')
class CivetConfig {
  configPath: string;
  config: any;
  oldVersion: boolean = false;

  constructor() {
    const app = require('./System').default.app()
    const civet = require('../../package.json')
    const version = civet.version
    console.info('version:', version)
    const userDir = app.getPath('userData')
    this.configPath = (app.isPackaged ? userDir + '/cfg.json' : 'cfg.json')
    let cfg = {
      app: {
        first: true,
        version: version
      },
      resources: []
    }
    console.info('cfgPath', this.configPath)
    if (!fs.existsSync(this.configPath)) {
      fs.writeFileSync(this.configPath, JSON.stringify(cfg))
    } else {
      const config = JSON.parse(fs.readFileSync(this.configPath))
      // cfg.app.first = false
      if (!config.app.version || config.app.version !== version) {
        // upgrade config here
        console.info('software should be upgrade')
        this.oldVersion = true;
        config.app.version = version
      }
      cfg = config
    }
    this.config = cfg
  }

  getConfig(reload: boolean) {
    if (reload) {
      this.config = JSON.parse(fs.readFileSync(this.configPath))
    }
    return this.config
  }

  getCurrentDB(): string {
    return this.config.app.default
  }

  getDBPath(name: string): string | null {
    for (const resource of this.config.resources) {
      if (this.config.app.default === resource.name) {
        return resource.db.path
      }
    }
    return null
  }

  meta() {
    for (const resource of this.config.resources) {
      if (this.config.app.default === resource.name) {
        return resource.meta
      }
    }
    return null
  }

  isFirstTime() {
    // const defaultName = this.config.app.default
    // const dbpath = this.getDBPath(defaultName)
    // if (!fs.existsSync(dbpath)) {
    //   this.config.app.first = true
    // }
    return this.config.app.first
  }

  isDBExist(name: string) {
    const path = this.getDBPath(name)
    console.info('is db exist:', path)
    return fs.existsSync(path)
  }

  switchResource(name: string) {
    this.config.app.default = name
  }

  getResourcesName(): string[] {
    const resources = []
    for (const resource of this.config.resources) {
      resources.push(resource.name)
    }
    return resources
  }

  getCurrentResource() {
    for (const resource of this.config.resources) {
      if (resource.name === this.config.app.default) return resource
    }
    return null
  }

  getRecentResources() {}

  addResource(name: string, path: string) {
    for (const resource of this.config.resources) {
      if (resource.name === name) {
        resource.db.path = path
        return
      }
    }
    this.config.app.default = name
    this.config.resources.push({
      name: name,
      db: { path: path + '/' + name },
      meta: this.schema()
    })
  }

  isMetaDisplay(name: string, meta: any) {
    console.info('meta name:', name)
    for (const item of meta) {
      if (item.name === name && item.display === true) return true
    }
    return false
  }

  save() {
    this.config.app.first = false
    console.info('save config', this.config)
    fs.writeFileSync(this.configPath, JSON.stringify(this.config))
  }

  shouldUpgrade() {
    return this.oldVersion;
  }

  get version() {
    return this.config.app.version
  }

  schema(filetype: string = 'img') {
    return [
      { name: 'color', value: '主色', type: 'val/array', query: true, size: 3, display: true },
      { name: 'size', value: '大小', type: 'str', query: true, display: true },
      { name: 'path', value: '路径', type: 'str', display: true },
      { name: 'filename', value: '文件名', type: 'str', display: true },
      { name: 'type', value: '类型', type: 'str', query: true, display: true },
      { name: 'datetime', value: '创建时间', type: 'date', query: true, display: true },
      { name: 'addtime', value: '添加时间', type: 'date', query: true, display: true },
      { name: 'width', value: '宽', type: 'str', display: true },
      { name: 'height', value: '高', type: 'str', display: true }
    ]
  }
}

export const config = new CivetConfig()
