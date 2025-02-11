export default class FileBase {
  constructor(json, type) {
    this.id = json.id || json.fileid
    this.filetype = type || json.filetype || 'img'
    this.type = type || json.filetype || 'img'
    this.meta = json.meta || []
    this.keyword = json.keyword || []
    this.category = json.category || json.class || []
    this.tag = json.tag || []
    for (const item of json.meta) {
      // console.info(item)
      if (item.name === 'width' || item.name === 'height') {
        this[item.name] = parseInt(item.value)
      } else {
        this[item.name] = item.value
      }
    }
    if (!this.path) this.path = json.path || ''
    if (!this.filename) this.filename = json.filename || ''
  }

  update(json) {
    if (this.meta.length === 0) this.meta = json.meta
    if (this.keyword.length === 0) this.keyword = json.keyword
    if (this.category.length === 0) this.category = json.category || json.class
    if (this.tag.length === 0) this.tag.length = json.tag.length
    for (const item of json.meta) {
      if (Object.prototype.hasOwnProperty.call(this, item.name)) continue
      if (item.name === 'width' || item.name === 'height') {
        this[item.name] = parseInt(item.value)
      } else {
        this[item.name] = item.value
      }
    }
  }

  addMeta(typename, value, type) {
    if (!this[typename]) {
      const meta = { name: typename, value: value, type: this.metaType(value, type) }
      this.meta.push(meta)
    } else {
      for (const item of this.meta) {
        if (item.name === typename) {
          item.value = value
          break
        }
      }
    }
    this[typename] = value
  }

  metaType(value, type) {
    if (!type) {
      switch (typeof value) {
        case 'number': return 'value'
        case 'object':
          if (value === null) return 'undefined'
          if (value instanceof Array) {
            if (value[0] === '#') return 'value'
            return 'array'
          }
          break
        case 'undefined': return 'undefined'
        default: break
      }
      return 'str'
    }
    return type
  }
}
