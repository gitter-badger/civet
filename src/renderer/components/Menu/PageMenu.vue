<template>
<el-container>
  <div class="page" :id="pageid[0]" v-show="currentPage === 0">
    <li size="mini" class="page-menu-item" @click="switchResource">切换资源库<span class="el-icon-arrow-right dock-right"></span></li>
    <li size="mini" class="page-menu-item" @click="deleteResource">删除资源库<span class="el-icon-arrow-right dock-right"></span></li>
    <li size="mini" class="page-menu-item" @click="createResource">新建资源库</li>
  </div>
  <div class="page" :id="pageid[1]" v-show="currentPage === 1">
    <li class="item-header"><span class="el-icon-arrow-left dock-left" @click="switch2Main"></span>切换</li>
    <li v-for="(resource, idx) in resources" :key="idx" class="page-menu-item" @click="onSwitch(resource)">
      <span v-if="idx===current" class="current">{{resource}}</span>
      <span v-else>{{resource}}</span>
    </li>
  </div>
  <div class="page" :id="pageid[2]" v-show="currentPage === 2">
    <li class="item-header"><span class="el-icon-arrow-left dock-left" @click="delete2Main"></span>删除</li>
    <li v-for="resource of resources" :key="resource" class="page-menu-item">
      {{resource}}
    </li>
  </div>
  <!-- <el-dialog title="新建资源库" :visible.sync="showDialog" :close-on-click-modal="false">
    <Guider @onclose="onCloseGuider"></Guider>
  </el-dialog> -->
  <dialog id="newresource" class="modal">
    <label>新建资源库:</label>
    <Guider @onclose="onCloseGuider" :enableClose="true"></Guider>
  </dialog>
</el-container>
</template>
<script>
import Guider from '@/components/Dialog/Guider'
import { config } from '@/../public/CivetConfig'
import Service from '../utils/Service'

export default {
  name: 'page-menu',
  components: {
    Guider
  },
  data() {
    return {
      pageid: ['main-page', 'switch-page', 'delete-page'],
      currentPage: 0
    }
  },
  props: {
    resources: {
      type: String,
      default: []
    },
    current: {type: Number, default: 0}
  },
  mounted() {
  },
  methods: {
    switchResource() {
      this.currentPage = 1
    },
    async onSwitch(resource) {
      // config
      console.info('resourcename:', resource)
      config.switchResource(resource)
      config.save()
      await this.$ipcRenderer.get(Service.REINIT_DB, resource)
      this.$nextTick(() => {
        this.$store.dispatch('init')
      })
    },
    deleteResource() {
      this.currentPage = 2
    },
    createResource() {
      const guider = document.getElementById('newresource')
      guider.showModal()
      // this.showDialog = true
    },
    delete2Main() {
      this.currentPage = 0
    },
    switch2Main() {
      this.currentPage = 0
    },
    onCloseGuider() {
      const cfg = document.getElementById('newresource')
      cfg.close()
    }
  }
}
</script>
<style scoped>
.page {
  width: 100%;
}
.page-menu-item {
  width: 100%;
  position: relative;
  display: block;
  padding: 3px 0;
  font-size: 14px;
}
.page-menu-item:hover {
  background-color:rgb(55, 80, 97);
  -webkit-user-select: none;
}
.current{
  color: rgb(60, 124, 219);
}
.dock-right {
  float: right;
}
.item-header{
  font-size: 14px;
  text-align: center;
  border-bottom: 1px solid black;
  padding-bottom: 8px;
}
.dock-left {
  float: left;
  font-weight: 600;
  font-size: large;
}
.dock-left:hover{
  background-color:rgb(55, 80, 97);
}
</style>