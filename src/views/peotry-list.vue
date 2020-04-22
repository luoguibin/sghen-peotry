<template>
  <div class="peotry-list" v-loading="isLoading">
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

import {
  queryUsers,
  queryPeotries,
  deletePeotry
} from '@/api'

export default {
  name: 'PeotryList',
  components: {
    peotry: () => import('@/components/peotry')
  },
  data() {
    return {
      limit: 10,
      curPage: 1,
      totalPage: 1,
      totalCount: 0,
      peotries: [],
      isLoading: false,

      iconDialogVisible: false
    }
  },

  created() {
    window.peotryList = this
    this.getPeotries()
    this.showBack(true)
  },
  computed: {
    ...mapState({
      userInfo: state => state.user,
      peotryOption: state => state.peotryOption
    })
  },
  watch: {
    $route() {
      this.getPeotries()
    },
    peotryOption: {
      deep: true,
      handler(e) {
        if (e.type === 'success') {
          this.getPeotries()
        }
      }
    },
    userInfo(e) {
      // todo: 只更新对应的作者信息
      this.updatePeotriesData()
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.curPage = val
      this.getPeotries()
    },
    handleSizeChange(val) {
      this.limit = val
      this.getPeotries()
    },

    /**
     * 更新诗词数据，如携带的作者信息
     */
    updatePeotriesData() {
      const datas = this.peotries
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

      if (idsSet.size < 1) {
        return
      }

      const ids = Array.from(idsSet)
      queryUsers(ids).then(data => {
        const userMap = {}
        data.forEach(user => {
          userMap[user.id] = user
        })
        this.userMap = userMap

        datas.forEach(peotry => {
          if (peotry.user && peotry.user.id) {
            peotry.user = userMap[peotry.user.id]
          }
          peotry.comments = peotry.comments.map(comment => {
            if (comment.fromId > 1) {
              comment.fromUser = userMap[comment.fromId]
            }
            if (comment.toId > 1) {
              comment.toUser = userMap[comment.toId]
            }
            return comment
          })
        })
      })
    },
    /**
     * 获取诗词列表
     */
    getPeotries() {
      this.$nprogress.start()
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
          this.peotries = data.data
          this.updatePeotriesData()
        })
        .finally(() => {
          this.isLoading = false
          this.$nprogress.done()
        })
    },
    /**
     * 删除诗词
     */
    onDelete(peotry) {
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
    /**
     * 更新诗词
     */
    onUpdate(peotry) {
      if (!peotry || !peotry.id) return
      this.setPeotryOption({
        type: 'update',
        key: 'peotry-list',
        data: JSON.stringify(peotry)
      })
    },

    ...mapActions({
      setUserInfo: 'setUser',
      showLogin: 'showLogin',
      showBack: 'showBack',
      setPeotryOption: 'setPeotryOption'
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
