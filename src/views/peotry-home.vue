<template>
  <el-container class="home">
    <el-header>
      <peotry-header></peotry-header>
      <login-dialog></login-dialog>
      <peotry-create :showCreate="showCreate" :peotry="updatePeotry" @on-close="onPeotryClose"></peotry-create>
    </el-header>

    <el-main ref="mainEl">
      <el-scrollbar>
        <el-dialog title="个人信息" :visible.sync="showUser">
          <el-form label-width="60px">
            <el-form-item label="ID" v-if="true">
              <el-input disabled v-model="showUserInfo.id"></el-input>
            </el-form-item>

            <el-form-item label="昵称">
              <el-input :disabled="true" v-model="showUserInfo.name"></el-input>
            </el-form-item>

            <el-form-item label="头像">
              <img :src="showUserInfo.iconUrl" style="max-width: 50px; vertical-align: top;" />
            </el-form-item>
          </el-form>
        </el-dialog>

        <div class="list" ref="listEl" @click="onClickImage($event)" v-loading="isLoading">
          <peotry
            v-for="(peotry, index) in peotries"
            :key="peotry.id"
            :peotry="peotry"
            class="peotry"
            @on-delete="onDelete"
            @on-update="onUpdate"
            @on-comment="onComment"
            @on-comment-delete="onCommentDelete"
          >
            <template>{{(curPage - 1) * limit + index + 1}}</template>
          </peotry>
        </div>

        <el-dialog
          title="图片"
          :visible.sync="showImage"
          class="show-image"
          :show-close="false"
          center
        >
          <el-image :src="showImageUrl">
            <div slot="error" class="image-error-slot">
              <i class="el-icon-picture-outline"></i>
              <p>图片加载失败</p>
            </div>
          </el-image>
        </el-dialog>
      </el-scrollbar>
    </el-main>

    <el-footer height="auto">
      <el-pagination
        v-show="peotries.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="curPage"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="limit"
        layout="prev, pager, next, total, sizes, jumper"
        :total="totalCount"
      ></el-pagination>
    </el-footer>
  </el-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import Peotry from '@/components/peotry'
import PeotryCreate from '@/components/peotry-create'
import {
  queryUsers,
  queryPeotries,
  deletePeotry,
  createComment,
  deleteComment
} from '@/api'

import { resetUserIconUrl } from '@/common/util-icon'

export default {
  name: 'HomePeotry',
  components: {
    'peotry-header': () => import('./peotry-header'),
    Peotry,
    PeotryCreate
  },
  data () {
    return {
      userMap: {},

      showCreate: false,
      showUser: false,
      showUserInfo: {},
      showImage: false,
      showImageUrl: '',
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
  provide () {
    return {
      userMap: this.userMap
    }
  },
  created () {
    window.homePeotry = this
    this.getPeotries()
  },
  computed: {
    ...mapState({
      userInfo: state => state.user,
      peotryCreate: state => state.peotryCreate
    })
  },
  watch: {
    userInfo: {
      immediate: true,
      handler () {
        const userInfo = this.userInfo
        if (userInfo.token) {
          // 重换登录后评论的fromId需要更新
          this.peotries.forEach(peotry => {
            if (peotry.comment) {
              peotry.comment.fromId = userInfo.id
            }
          })

          this.userMap[userInfo.id] = JSON.parse(JSON.stringify(userInfo))

          if (this.showUserInfo.id) {
            this.showUserInfo = this.userMap[this.showUserInfo.id]
          }
        } else {
          // 相应token清空
          const userMap = this.userMap
          for (const key in userMap) {
            if (userMap.hasOwnProperty(key) && userMap[key].token) {
              userMap[key].token = ''
            }
          }
        }
      }
    },
    peotryCreate () {
      this.showCreate = true
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
              resetUserIconUrl(user)
              userMap[user.id] = user
            }
          })
          this.$forceUpdate()
        })
      }
    },

    getPeotries (bottom) {
      this.isLoading = true
      this.peotries = []

      queryPeotries({
        limit: this.limit,
        page: this.curPage,
        needComment: true
      })
        .then(resp => {
          const data = resp.data
          this.curPage = data.curPage
          this.totalPage = data.totalPage
          this.totalCount = data.totalCount
          this.updatePeotriesData(data.data)
          this.peotries = data.data

          this.$nextTick(() => {
            const main = this.$refs.mainEl.$el
            main.scrollTop = bottom ? main.scrollHeight : 0
          })
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    onDelete (peotry) {
      if (!peotry || !peotry.id) return

      deletePeotry(peotry.id).then(resp => {
        this.$message.success('删除成功')
        if (this.peotries.length === 1) {
          this.curPage--
        } else {
          this.getPeotries()
        }
      })
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
        if (this.totalCount % this.limit === 0) {
          this.totalPage++
        }
        if (this.curPage !== this.totalPage) {
          this.curPage = this.totalPage
        }
      }
      this.getPeotries(createValue)
    },

    onComment (comment, peotryId) {
      if (!this.userInfo.token) {
        this.$message.warning('请登录后再操作')
        this.showLogin()
        return
      }
      createComment(comment).then(resp => {
        comment.id = resp.data.data
        if (comment.toId > 0) {
          this.$message.success('评论成功')
          this.addComment(peotryId, comment)
          return
        }
        if (comment.content.indexOf('unpraise') !== -1 && peotryId) {
          this.spliceComment(peotryId, comment.id)
        } else {
          this.addComment(peotryId, comment)
        }
      })
    },

    addComment (peotryId, comment) {
      const peotry = this.peotries.find(o => o.id === peotryId)
      if (peotry) {
        // window.testPeotry = peotry
        const newComment = JSON.parse(JSON.stringify(comment))
        newComment.createTime = new Date().toJSON()
        peotry.comments.push(newComment)
      }
    },

    spliceComment (peotryId, id) {
      this.peotries.forEach(peotry => {
        if (peotry.id === peotryId && peotry.comments) {
          const index = peotry.comments.findIndex(comment => comment.id === id)
          if (index !== -1) {
            peotry.comments.splice(index, 1)
          }
        }
      })
    },

    onCommentDelete (id, peotryId) {
      deleteComment({ id, fromId: this.userInfo.id }).then(resp => {
        this.$message.success('删除成功')
        this.spliceComment(peotryId, id)
      })
    },

    onClickImage (e) {
      const el = e.srcElement
      if (el.tagName === 'IMG') {
        const imgType = el.getAttribute('img-type')
        if (imgType === 'picture') {
          this.showImageUrl = el.getAttribute('src')
        } else if (imgType.indexOf('user-') === 0) {
          if (imgType === 'user-self') {
            return
          }
          const id = parseInt(imgType.replace('user-', ''))
          const user = this.userMap[id]
          if (!user) {
            this.$message.error('用户账号异常')
            return
          }
          this.showUser = true
          this.showUserInfo = user
        }
      } else {
        this.showImageUrl = ''
      }
      this.showImage = !!this.showImageUrl
    },

    ...mapActions({
      setUserInfo: 'setUser',
      showLogin: 'showLogin'
    })
  }
}
</script>

<style lang="scss" scoped>
.home {
  height: 100%;
  // overflow: hidden;

  .el-header {
    background-color: rgba(222, 222, 222, 0.2);
    box-shadow: 0 0 3px 3px rgba(222, 222, 222, 0.8);
  }

  .el-main {
    height: 100%;
    padding: 0;

    .el-scrollbar {
      background-color: transparent;
    }

    .list {
      max-width: 500px;
      min-height: 200px;
      margin: 10px auto;

      .peotry {
        // margin-bottom: 30px;
      }

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
  }
}

@media screen and (max-width: 500px) {
  .home {
    .el-main {
      .peotry {
        // padding: 0 10px 0 30px;
      }
    }
  }
}
</style>

<style lang="scss">
.home {
  .show-image {
    .el-dialog__body {
      text-align: center !important;
    }
  }

  .el-footer {
    padding: 0;
  }

  .el-pagination {
    white-space: pre-wrap;
    text-align: center;
  }

  .image-error-slot {
    .el-icon-picture-outline {
      font-size: 50px;
    }
  }
}

@media screen and (max-width: 500px) {
  .home {
    .el-dialog {
      width: 100%;
    }
  }
}
</style>
