import FileBase from '@/../public/FileBase'
import Service from '@/components/utils/Service'
import { Tree, TreeNode } from '@/components/Control/Tree'
import { isEmpty } from '@/../public/Utility'
import Vue from 'vue'

const Cache = {
  query: {},
  files: {}
}
// const maxCacheSize = 40 + 20 + 10

const state = {
  classes: new Tree([]),
  // classes: [{name: 'test', id: 2, count: 15, children: [{name: 'child', id: 3, count: 1, children: [{name: 'aaa', id: 5, count: 1, children: [{name: 'bbb', id: 7, count: 0}]}]}]}, {name: '测试', id: 4, count: 10}],
  classesName: [],
  viewItems: [],
  viewClass: [],
  tags: {},
  allCount: 0,
  untags: 0,
  unclasses: 0,
  // router histories count
  histories: 0
}

const getters = {
  viewItems: state => (page = 0, size = 50) => {
    if (state.viewItems.length < size) {
      return state.viewItems
    }
    const start = page * size
    if (start < state.viewItems.length) {
      return state.viewItems
    }
  },
  viewClass: state => {
    return state.viewClass
  },
  classes: state => { return state.classes },
  getFiles: (state, getters) => {
    return (filesID) => {
      console.info('get files: ', filesID)
      const files = []
      for (const fileID of filesID) {
        const file = Cache.files[fileID]
        if (file !== null) {
          files.push(file)
        }
      }
      return files
    }
  },
  classesName: state => { return state.classesName },
  untags: state => { return state.untags },
  unclasses: state => { return state.unclasses },
  tags: state => { return state.tags },
  allCount: state => { return state.allCount },
  histories: state => { return state.histories }
}

const remote = {
  async recieveCounts() {
    const uncalsses = await Service.getServiceInstance().get(Service.GET_UNCATEGORY_IMAGES)
    const untags = await Service.getServiceInstance().get(Service.GET_UNTAG_IMAGES)
    console.info('untag is', untags, 'unclasses:', uncalsses)
    return { unclasses: uncalsses, untags: untags }
  },
  async recieveTags() {
    return Service.getServiceInstance().get(Service.GET_ALL_TAGS)
  }
}

const mutations = {
  init(state, data) {
    console.info('cache init', data)
    // let snaps = data.filesSnap
    // let imagesID = []
    // for (let snap of snaps) {
    //   imagesID.push(snap.id)
    //   // if (imagesID.length > 40) break
    // }
    const images = data.allImages
    for (const image of images) {
      Cache.files[image.id] = new FileBase(image)
      // if (Cache.files.length > maxCacheSize) break
    }
    // const len = state.cache.length
    // setting view panel item
    mutations.display(state, data)
    // get classes
    const cls = data.allClasses
    console.info('allClasses', cls)
    if (cls) {
      const addChildren = function (children, parent) {
        if (children && children.length > 0) {
          for (let i = 0; i < children.length; ++i) {
            if (typeof children[i] === 'object') {
              const child = new TreeNode({ name: children[i].name, isLeaf: false, count: children[i].count })
              parent.addChildren(child, true)
              addChildren(children[i].children, child)
            }
          }
        }
      }
      for (let idx = 0; idx < cls.length; ++idx) {
        const clazz = cls[idx]
        if (!clazz) continue
        console.info('clazz:', clazz)
        // Vue.set(state.classes, idx, clazz)
        const root = new TreeNode({ name: clazz.name, isLeaf: false, count: clazz.count })
        if (clazz.children && clazz.children.length > 0) {
          addChildren(clazz.children, root)
        }
        state.classes.addChildren(root)
      }
      console.info('class result', state.classes)
    }
    // init classes name
    const generateClassPath = (item, index, array) => {
      if (!array[index].parent) return
      let cpath
      if (array[index].parent.name !== 'root') {
        cpath = array[index].parent.name + '/' + item.name
      } else {
        cpath = item.name
      }
      console.info('generateClassPath', cpath)
      state.classesName.push(cpath)
      const children = array[index].children
      if (!children) return
      children.map(generateClassPath)
      // classesPath.unshift(cpath)
    }
    if (state.classes && state.classes.children && state.classes.children.length) {
      const candidates = state.classes.children.map(generateClassPath)
      console.info('candidates', candidates, state.classes.children)
    }
    // count
    state.unclasses = data.unclasses.length
    state.untags = data.untags.length
    state.allCount = data.filesSnap.length
    // tags
    state.tags = data.allTags
    console.info('init finish')
  },
  addFiles(state, files) {
    const idx = 0
    console.info('addFiles:', files)
    let cnt = 0
    for (const file of files) {
      if (Cache.files.hasOwnProperty(file.id)) {
        // TODO: update file info
        Cache.files[file.id].update(file)
        continue
      }
      Cache.files[file.id] = new FileBase(file)
      cnt += 1
      // setting view panel item
      // if (Cache.files.length > maxCacheSize) break
      const pos = state.viewItems.length + idx
      Vue.set(state.viewItems, pos, Cache.files[file.id])
    }
    state.allCount += cnt
  },
  display(state, data) {
    let idx = 0
    if (data) {
      // for (let datum of data) {}
    }
    state.viewClass.splice(0, state.viewClass.length)
    for (const k in Cache.files) {
      Vue.set(state.viewItems, idx, Cache.files[k])
      idx += 1
      // if (idx > maxCacheSize) break
    }
  },
  async query(state, result) {
    //   console.info('++++++')QUERY_FILES
    state.viewItems.splice(0, state.viewItems.length)
    for (let idx = 0; idx < result.length; ++idx) {
      Vue.set(state.viewItems, idx, Cache.files[result[idx].id])
    }
    console.info(state.viewItems, result)
  },
  updateTag(state, info) {
    // const {unclasses, untags} = await remote.recieveCounts()
    state.untags = info.untags
    // update tags
    state.tags = info.tags
  },
  addClass(state, mutation) {
    if (Array.isArray(mutation)) {
      if (!state.classes.children) state.classes.children = []
      state.classes.addChildren(new TreeNode({ name: mutation[0], isLeaf: false, editable: true }))
      if (isEmpty(mutation[0])) return
      this.addClassName(mutation[0])
    } else if (typeof mutation === 'object') {
      const children = mutation.node
      let parent = mutation.parent
      parent.addChildren(children, true)
      // make path
      if (isEmpty(children.name)) return
      let classPath = children.name
      while (parent.parent !== null) {
        classPath = parent.name + '/' + classPath
        parent = parent.parent
      }
      this.addClassName([classPath])
    }
  },
  addClassName(state, names) {
    if (!names.length) {
      state.classesName.push(names)
      Service.getServiceInstance().send(Service.ADD_CATEGORY, names)
    } else {
      state.classesName.push(names)
      console.info('classPath:', names)
      Service.getServiceInstance().send(Service.ADD_CATEGORY, names)
    }
  },
  addClassOfFile(state, mutation) {
    const fileid = mutation.id
    const classpath = mutation.path
    console.info('addClassOfFile', fileid, classpath)
    const file = Cache.files[fileid]
    console.info(file)
    if (!file.category) file.category = []
    file.category.push(classpath)
    Service.getServiceInstance().send(Service.ADD_CATEGORY, { id: [fileid], class: [classpath] })
  },
  removeClass(state, mutation) {
    console.info('remove class', mutation, state.classesName)
    if (Array.isArray(mutation)) {
      for (const clsName of mutation) {
        // remove from className
        state.classesName.splice(state.classesName.indexOf(clsName), 1)
        // remove from classes
        for (let idx = state.classes.length - 1; idx >= 0; --idx) {
          if (state.classes[idx].name === clsName) {
            state.classes.splice(idx, 1)
            break
          }
        }
        // remove from relavent files
        for (const fileid in Cache.files) {
          const file = Cache.files[fileid]
          // console.info(file)
          const pos = file.category.indexOf(clsName)
          if (pos >= 0) file.category.splice(pos, 1)
        }
      }
    } else {
      let classPath = mutation.name
      // class path
      let node = mutation.parent
      while (node.parent !== null) {
        classPath = node.name + '/' + classPath
        node = node.parent
      }
      console.info('delete class path:', classPath, 'node', mutation)
      mutation.remove()
      state.classesName.splice(state.classesName.indexOf(classPath), 1)
      Service.getServiceInstance().send(Service.REMOVE_CLASSES, [classPath])
    }
  },
  removeClassOfFile(state, mutation) {
    const fileid = mutation.id
    const classpath = mutation.path
    console.info('remove class of file', fileid, classpath)
    const file = Cache.files[fileid]
    for (let idx = 0; idx < file.category.length; ++idx) {
      if (file.category[idx] === classpath) {
        file.category.splice(idx, 1)
        Service.getServiceInstance().send(Service.REMOVE_CLASSES, { id: [fileid], class: [classpath] })
        break
      }
    }
  },
  changeClassName(state, mutation) {
    console.info('changeClassName', mutation, state.classesName)
    const indx = state.classesName.indexOf(mutation.old)
    state.classesName[indx] = mutation.new
    Service.getServiceInstance().send(Service.UPDATE_CATEGORY_NAME, { oldName: mutation.old, newName: mutation.new })
  },
  changeFileName(state, mutation) {
    console.info('changeFileName', mutation)
    const fileid = mutation.id
    Cache.files[fileid].filename = mutation.filename
    Service.getServiceInstance().send(Service.UPDATE_FILE_NAME, mutation)
  },
  removeFiles(state, filesid) {
    for (let idx = 0; idx < filesid.length; ++idx) {
      // remove from cache
      Vue.delete(Cache.files, filesid[idx])
    }
    let removeCnt = 0
    for (let idx = 0; idx < state.viewItems.length; ++idx) {
      if (removeCnt === filesid.length) break
      for (let fidx = 0; fidx < filesid.length; ++fidx) {
        if (state.viewItems[idx].id === filesid[fidx]) {
          Vue.delete(state.viewItems, idx)
          removeCnt += 1
          break
        }
      }
    }
    state.allCount -= removeCnt
    // remove from db
    Service.getServiceInstance().send(Service.REMOVE_FILES, filesid)
  },
  removeTags(state, mutation) {
    Service.getServiceInstance().send(Service.REMOVE_TAG, { tag: [mutation.tag], filesID: [mutation.id] })
    const file = Cache.files[mutation.id]
    file.tag.splice(file.tag.indexOf(mutation.tag), 1)
  },
  update(state, sql) {},
  updateHistoryLength(state, value) {
    state.histories = value
  },
  updateCounts(state, counts) {
    // count
    state.unclasses = counts.unclasses.length
    state.untags = counts.untags.length
  },
  getClassesAndFiles(state, classesFiles) {
    console.info('getClassesAndFiles', classesFiles)
    // state.viewItems.splice(0, state.viewItems.length)
    let clsIdx = 0
    let fileIdx = 0
    state.viewClass.splice(0, state.viewClass.length)
    state.viewItems.splice(0, state.viewItems.length)
    for (let idx = 0; idx < classesFiles.length; ++idx) {
      if (classesFiles[idx].type === 'clz') {
        const item = {}
        item.path = classesFiles[idx].name
        const pos = classesFiles[idx].name.lastIndexOf('/') + 1
        item.name = classesFiles[idx].name.substring(pos)
        Vue.set(state.viewClass, clsIdx++, item)
      } else {
        Vue.set(state.viewItems, fileIdx++, Cache.files[classesFiles[idx].id])
      }
    }
    // console.info('display classes', state.viewClass)
  }
}

const actions = {
  async init({ commit }, flag) {
    console.info('+++++++++++++++')
    const { unclasses, untags } = await remote.recieveCounts()
    const allClasses = await Service.getServiceInstance().get(Service.GET_ALL_CATEGORY, '/')
    console.info('all classes:', allClasses)
    const filesSnap = await Service.getServiceInstance().get(Service.GET_FILES_SNAP)
    const imagesID = []
    for (const snap of filesSnap) {
      imagesID.push(snap.id)
      // if (imagesID.length > maxCacheSize) break
    }
    const allImages = await Service.getServiceInstance().get(Service.GET_IMAGES_INFO, imagesID)
    const allTags = await Service.getServiceInstance().get(Service.GET_ALL_TAGS)
    console.info('recieveCounts:', unclasses, 'tags:', allTags)
    commit('init', { unclasses, untags, allClasses, filesSnap, allImages, allTags })
  },
  async query({ commit }, query) {
    for (const k in query) {
      if (Array.isArray(query[k]) && query[k].length === 0) {
        delete Cache.query[k]
        continue
      }
      Cache.query[k] = query[k]
      console.info('query add key', k, Cache.query)
    }
    const result = await Service.getServiceInstance().get(Service.QUERY_FILES, Cache.query)
    console.info('query: ', Cache.query, 'result: ', result)
    commit('query', result)
  },
  display({ commit }, data) {
    commit('display', data)
  },
  removeFiles({ commit }, files) {
    commit('removeFiles', files)
  },
  async addFiles({ commit }, files) {
    await commit('addFiles', files)
    // count
    const counts = await remote.recieveCounts()
    await commit('updateCounts', counts)
  },
  async addTag({ commit }, mutation) {
    const { fileID, tag } = mutation
    console.info('cache add tag:', fileID, tag)
    const file = Cache.files[fileID]
    if (!file) {
      return
    }
    file.tag.push(tag)
    Service.getServiceInstance().send(Service.SET_TAG, { id: [fileID], tag: file.tag })
    const tags = await remote.recieveTags()
    const { ...untags } = await remote.recieveCounts()
    commit('updateTag', {tags, untags})
  },
  addClass({ commit }, mutation) {
    commit('addClass', mutation)
  },
  async addClassOfFile({ commit }, mutation) {
    await commit('addClassOfFile', mutation)
  },
  removeClass({ commit }, node) {
    commit('removeClass', node)
  },
  async removeClassOfFile({ commit }, mutation) {
    await commit('removeClassOfFile', mutation)
  },
  removeTags({ commit }, mutation) {
    commit('removeTags', mutation)
  },
  changeFileName({ commit }, mutation) {
    commit('changeFileName', mutation)
  },
  changeClassName({ commit }, mutation) {
    if (mutation.old[mutation.old.length - 1] === '/' || isEmpty(mutation.old)) {
      commit('addClassName', mutation.new)
      return
    }
    commit('changeClassName', mutation)
  },
  async getClassesAndFiles({ commit }, query) {
    const allClasses = await Service.getServiceInstance().get(Service.GET_CATEGORY_DETAIL, query)
    commit('getClassesAndFiles', allClasses)
  },
  update({ commit }, sql) {
    /*
     *  sql like: {query:'', $set:{}}, {query:'', $unset:{}}
     */
    commit('update', sql)
  },
  remove({ commit }, sql) {
    /*
     *  sql like: {query:''}
     */
    commit('update', sql)
  },
  insert({ commit }, sql) {
    /*
     *  sql like: {query:'', value: {}}
     */
  },
  updateHistoryLength({ commit }, value) {
    commit('updateHistoryLength', value)
  }
}

// const utils = {
//   getFileFromCache: () => {}
// }
export default {
  state,
  getters,
  mutations,
  actions
}
