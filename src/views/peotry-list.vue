<template>
  <div class="peotry-list" v-loading="isLoading">
    <peotry-create :showCreate="showCreate" :peotry="updatePeotry" @on-close="onPeotryClose"></peotry-create>

    <div v-show="!isLoading && peotries.length === 0" class="show-empty">暂无数据</div>

    <div class="list" ref="listEl" >
      <template  v-for="(peotry, index) in peotries">
        <peotry
          :key="peotry.id"
          :peotry="peotry"
          :showMore="true"
          @on-delete="onDelete"
          @on-update="onUpdate"
        >
          <template>{{(curPage - 1) * limit + index + 1}}</template>
        </peotry>
        <el-divider :key="peotry.id"></el-divider>
      </template>
    </div>

    <el-pagination
      v-show="peotries.length"
      background
      hide-on-single-page
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="curPage"
      :page-size="limit"
      layout="prev, next, total, slot, jumper"
      :total="totalCount"
    >
    <span class="el-pagination__total">{{totalPage}}页</span>
    </el-pagination>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import PeotryCreate from '@/components/peotry-create'
import {
  queryUsers,
  queryPeotries,
  deletePeotry
} from '@/api'

export default {
  name: 'PeotryList',
  components: {
    peotry: () => import('@/components/peotry'),
    PeotryCreate
  },
  data () {
    return {
      showCreate: false,
      updatePeotry: null,

      limit: 10,
      curPage: 1,
      totalPage: 1,
      totalCount: 0,
      peotries: [],
      isLoading: false,

      iconDialogVisible: false
    }
  },

  inject: ['userMap'],

  created () {
    window.peotryList = this
    this.getPeotries()
    this.showBack(true)
    this.pushDropMenu({ command: 'peotry', name: '创建诗词' })
  },
  beforeDestroy () {
    this.pushDropMenu({ command: 'peotry', remove: true })
  },
  computed: {
    ...mapState({
      userInfo: state => state.user,
      peotryCreate: state => state.peotryCreate
    })
  },
  watch: {
    peotryCreate () {
      this.showCreate = true
    },
    $route () {
      this.getPeotries()
    }
  },
  methods: {
    handleCurrentChange (val) {
      this.curPage = val
      this.getPeotries()
    },

    handleSizeChange (val) {
      this.limit = val
      this.getPeotries()
    },

    updatePeotriesData (datas) {
      const idsSet = new Set()
      datas.forEach(peotry => {
        if (peotry.user && peotry.user.id) {
          idsSet.add(peotry.user.id)
        }

        const comments = peotry.comments
        if (comments && comments.length) {
          comments.forEach(comment => {
            if (comment.fromId > 1) {
              idsSet.add(comment.fromId)
            }
            if (comment.toId > 1) {
              idsSet.add(comment.toId)
            }
          })
        } else {
          peotry.comments = []
        }
      })

      if (idsSet.size) {
        const ids = Array.from(idsSet)
        queryUsers(ids).then(resp => {
          const users = resp.data.data
          const userMap = this.userMap

          users.forEach(user => {
            if (!userMap[user.id]) {
              userMap[user.id] = user
            }
          })
          datas.forEach(peotry => {
            if (peotry.comments && peotry.comments.length) {
              peotry.comments = peotry.comments.map(comment => {
                comment.fromUser = userMap[comment.fromId]
                return comment
              })
            }
          })
        })
      }
    },

    getPeotries (bottom) {
      this.$NProgress.start()
      this.isLoading = true
      this.peotries = []

      const routeQuery = this.$route.query
      queryPeotries({
        limit: this.limit,
        page: this.curPage,
        needComment: true,
        ...routeQuery
      })
        .then(resp => {
          const data = resp.data
          this.curPage = data.curPage
          this.totalPage = data.totalPage
          this.totalCount = data.totalCount
          this.updatePeotriesData(data.data)
          this.peotries = data.data
          this.resetScrollTop()
        })
        .finally(() => {
          this.isLoading = false
          this.$NProgress.done()
        })
    },

    onDelete (peotry) {
      if (!peotry || !peotry.id) return

      this.$confirm('是否删除该诗词？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deletePeotry(peotry.id, this.userInfo.id).then(resp => {
            this.$message.success('删除成功')
            if (this.peotries.length === 1) {
              this.curPage--
            } else {
              this.getPeotries()
            }
          })
        })
        .catch(e => {})
    },

    onUpdate (peotry) {
      if (!peotry || !peotry.id) return
      this.updatePeotry = peotry
    },

    onPeotryClose ({ createValue, currentId }) {
      this.updatePeotry = null
      this.showCreate = false
      if (!currentId) {
        return
      }
      if (createValue) {
        this.curPage = 1
      }
      this.getPeotries(createValue)
    },

    ...mapActions({
      setUserInfo: 'setUser',
      showLogin: 'showLogin',
      showBack: 'showBack',
      pushDropMenu: 'pushDropMenu',
      resetScrollTop: 'resetScrollTop'
    })
  }
}
</script>

<style lang="scss" scoped>
.peotry-list {
  min-height: inherit;
  max-width: 800px;
  padding: 20px 8px;
  margin: 0 auto;

  .list {
    min-height: 300px;
    margin: 10px auto;

    .image-show {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  .show-empty {
    padding: 20px;
    text-align: center;
    font-size: 16px;
  }
}
</style>

<style lang="scss">
.peotry-list {
  .el-pagination {
    white-space: pre-wrap;
    text-align: center;
  }
}
</style>
