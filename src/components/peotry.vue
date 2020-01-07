<template>
  <div :class="['peotry', 'peotry-' + mode]">
    <img class="peotry-user" img-type="user-self" :src="peotry.user | user-icon" />
    <div class="title">
      <span
        v-if="peotry.set"
        class="tooltip peotry-set"
        :tooltip="'选集：' + peotry.set.name"
      >{{peotry.set.name}}</span>
      <span v-if="peotry.set && peotry.title" class="peotry-set_dot">*</span>
      <span class="peotry-title" v-show="peotry.title">{{peotry.title}}</span>
      <span class="peotry-count" v-show="!isDetail && praiseComments.length">
        <i class="el-icon-star-on"></i>
        {{praiseComments.length}}
      </span>
    </div>
    <div class="peot">
      <template v-if="mode === 'row'">
        {{peotry.user ? '--' + peotry.user.name : ""}}
        <span v-if="!hideTime">于{{peotry.time | time-format}}</span>
      </template>
      <template v-else>
        {{peotry.user ? peotry.user.name : ""}}
        <span v-if="!hideTime">--{{peotry.time | time-format}}</span>
      </template>
    </div>

    <!-- `white-wrap: pre-wrap` and code's format -->
    <div class="content-container" ref="contentEl" :style="{height: contentHeight}">
      <div :class="{'content': true }" v-html="peotry.content"></div>
      <div class="end" v-if="peotry.end">{{peotry.end}}</div>
    </div>
    <div v-if="canExpand" :class="{'content-expand': true, 'content-expand_shadow': isDetail}">
      <p v-show="contentHeight !== 'initial'">...</p>
      <span @click="onClickExpand">{{contentHeight === 'initial' ? '收起全文' : '展开全文'}}</span>
    </div>

    <div class="images" v-if="peotryImages.length">
      <el-image v-for="value in peotryImages" :key="value"
        :src="value" :fit="`cover`" :preview-src-list="peotryImages" :scroll-container="mainScrollBox" lazy>
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
    </div>

    <div class="peotry-more" v-if="isDetail">
      <el-dropdown @command="onCommandMore" trigger="click">
        <i class="peotry-more_icon el-icon-more-outline"></i>

        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="comment">
            <span>
              评论
              <i class="el-icon-edit-outline"></i>
            </span>
          </el-dropdown-item>

          <el-dropdown-item command="praise">
            <span>
              {{currentPraise ? "取消点赞" : "点赞"}}
              <i
                :class="[currentPraise ? 'el-icon-star-on' : 'el-icon-star-off']"
              ></i>
            </span>
          </el-dropdown-item>

          <el-dropdown-item v-if="isSelfPeotry" command="update">
            <span>
              更新
              <i class="el-icon-edit-outline"></i>
            </span>
          </el-dropdown-item>

          <el-dropdown-item v-if="isSelfPeotry" command="delete">
            <span>
              删除
              <i class="el-icon-delete"></i>
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <div class="comments" v-if="isDetail && (praiseComments.length || realComments.length)">
      <div class="praise-users">
        <img
          v-for="comment in praiseComments"
          :key="comment.id"
          :img-type="'user-' + comment.fromId"
          :src="(comment.fromUser ? comment.fromUser : '') | user-icon"
        />
      </div>

      <div
        v-for="comment in realComments"
        class="comment"
        :key="comment.id"
        @click.stop="onCommentUser($event)"
      >
        <div class="users">
          <span
            class="user"
            :user-id="comment.fromId"
            :comment-id="comment.id"
          >{{userMap[comment.fromId] ? userMap[comment.fromId].name : comment.fromId}}</span>
          <span v-if="comment.toId !== comment.fromId" class="comment_to">回复</span>
          <span
            v-if="comment.toId !== comment.fromId"
            class="user"
            :user-id="comment.toId"
          >{{userMap[comment.toId] ? userMap[comment.toId].name : comment.toId}}</span>
          <span class="comment_dot">:</span>
        </div>
        <p>{{comment.content}}</p>
      </div>
    </div>
    <div v-if="isDetail && inComment" class="comment-input">
      <h5
        v-if="peotry.comment.toId !== userInfo.id"
        style="text-align: left;"
      >回复：{{userMap[peotry.comment.toId] ? userMap[peotry.comment.toId].name : peotry.comment.toId}}</h5>
      <el-input
        ref="commentEl"
        type="textarea"
        :autosize="{ maxRows: 4}"
        maxlength="100"
        show-word-limit
        placeholder="请输入内容"
        v-model="peotry.comment.content"
      ></el-input>
      <el-button
        @click.stop="onCommentSubmit"
        size="small"
        :disabled="!peotry.comment.content.trim()"
      >提交</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { baseUrl } from '@/api/config'

export default {
  props: {
    peotry: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: 'column'
    },
    isDetail: {
      type: Boolean,
      default: true
    },
    hideTime: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showDelete: false,
      inComment: false,
      clickTime: 0,
      canExpand: false,
      contentHeight: 'initial',
      baseUrl,
      mainScrollBox: null
    }
  },
  inject: ['userMap'],
  created () {
    const mainScrollEl = document.getElementById('main-scroll')
    if (mainScrollEl && mainScrollEl.children) {
      this.mainScrollBox = mainScrollEl.children[0]
    }
  },
  mounted () {
    this.checkCanExpand(true)
  },
  methods: {
    /**
     * 分发诗词操作
     */
    onCommandMore (key) {
      switch (key) {
        case 'comment':
          this.openComment(this.userInfo.id)
          break
        case 'praise':
          this.onCommentPraise()
          break
        case 'update':
          this.$emit('on-update', this.peotry)
          break
        case 'delete':
          this.$emit('on-delete', this.peotry)
          break
        default:
          break
      }
    },

    /**
     * 检测当前评论对象
     * 若toId===fromId，表示直接评论诗词；
     * 若toId===-1，表示点赞诗词；
     * 否则为回复某用户的评论
     * @param {Integer} toId
     */
    checkComment (toId) {
      let comment = this.peotry.comment
      if (!comment) {
        comment = {
          id: 0,
          content: '',
          type: 1,
          typeId: this.peotry.id,
          fromId: this.userInfo.id,
          toId: toId
        }
        this.$set(this.peotry, 'comment', comment)
      }
      comment.fromId = this.userInfo.id
      comment.toId = toId
      comment.content = ''
    },
    checkCanExpand (widthExpand) {
      const contentEl = this.$refs.contentEl
      if (contentEl.clientHeight >= 120) {
        this.canExpand = true
        if (widthExpand) {
          this.onClickExpand()
        }
      }
    },
    onClickExpand () {
      this.contentHeight = this.contentHeight === 'initial' ? '105px' : 'initial'
    },

    openComment (toId) {
      if (!this.userInfo.token) {
        this.$message.warning('请登录后再操作')
        return
      }
      this.inComment = true
      this.checkComment(toId)
      this.$nextTick(() => {
        this.$refs.commentEl.focus()
      })

      this.setOutClick(true)
    },

    setOutClick (flag) {
      if (flag) {
        if (!this.onOutClick) {
          this.onOutClick = e => {
            let el = e.srcElement
            let count = 0
            const parentElement = this.$refs.commentEl.$el.parentElement
            // 3代节点内检测是否还处于评论编辑框附近
            while (el && count < 3) {
              if (el === parentElement) {
                break
              } else {
                count++
                el = el.parentElement
              }
            }
            if (el === parentElement) {
              return
            }
            this.setOutClick(false)
            this.inComment = false
          }
        }
        window.addEventListener('click', this.onOutClick)
      } else {
        window.removeEventListener('click', this.onOutClick)
      }
    },

    onCommentUser (e) {
      if (!this.userInfo.token) {
        this.$message.warning('请登录后再操作')
        return
      }
      const userId = e.srcElement.getAttribute('user-id')
      if (userId) {
        const toId = parseInt(userId)
        const commentId = parseInt(e.srcElement.getAttribute('comment-id'))
        if (toId !== this.userInfo.id) {
          this.openComment(toId)
        } else if (commentId) {
          this.$confirm('是否删除该评论？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.inComment = false
              this.$emit('on-comment-delete', commentId, this.peotry.id)
            })
            .catch(e => {})
        }
      }
    },
    onCommentPraise () {
      if (!this.userInfo.token) {
        this.$message.warning('请登录后再操作')
        return
      }
      this.checkComment(-1)
      const comment = this.peotry.comment
      comment.id = this.currentPraise ? this.myPraiseComment.id : comment.id
      comment.content = this.currentPraise ? 'unpraise' : 'praise'

      this.onCommentSubmit()
    },
    onCommentSubmit () {
      this.$emit('on-comment', this.peotry.comment, this.peotry.id)
      this.setOutClick(false)
      this.inComment = false
    }
  },
  computed: {
    /**
     * @returns {Boolean} 返回是否为当前用户创建的诗词
     */
    isSelfPeotry () {
      return this.peotry.user && this.userInfo.id === this.peotry.user.id
    },

    /**
     * @returns {Array} 返回诗词的直接可用图片列表
     */
    peotryImages () {
      const imageObj = this.peotry.image
      if (imageObj && imageObj.count) {
        return JSON.parse(imageObj.images).map(v => {
          if (v.indexOf('.') === 0) {
            return '/peotry/images/' + v.substr(1)
          } else {
            return '/peotry/images/' + v
          }
        })
      } else {
        return []
      }
    },

    /**
     * @returns {Array} 返回用户评论列表
     */
    realComments () {
      if (!this.peotry.comments) return []
      return this.peotry.comments
        .filter(comment => comment.toId > 0)
        .sort(function (o0, o1) {
          // 按时间排序评论列表
          const time0 = new Date(o0.createTime).getTime()
          const time1 = new Date(o1.createTime).getTime()
          return time0 < time1 ? -1 : 1
        })
    },

    /**
     * @returns {Array} 返回用户点赞列表
     */
    praiseComments () {
      if (!this.peotry.comments) return []
      return this.peotry.comments
        .filter(comment => comment.toId === -1 && comment.content === 'praise')
        .sort(function (o0, o1) {
          // 按时间排序评论列表
          const time0 = new Date(o0.createTime).getTime()
          const time1 = new Date(o1.createTime).getTime()
          return time0 < time1 ? -1 : 1
        })
    },

    /**
     * @returns {Comment} 返回我的点赞对象
     */
    myPraiseComment () {
      if (!this.userInfo) return
      return this.praiseComments.find(
        comment => comment.toId === -1 && comment.fromId === this.userInfo.id
      )
    },

    /**
     * @returns {Boolean} 返回当前登录用户是否点赞当前诗词
     */
    currentPraise () {
      return this.myPraiseComment && this.myPraiseComment.content === 'praise'
    },

    ...mapState({
      userInfo: state => state.user
    })
  }
}
</script>

<style scoped lang="scss">
$size-content: 18px;
$padding-set: 12px;

.peotry {
  position: relative;
  padding-left: 38px;

  .peotry-user {
    width: 26px;
    height: 26px;
    object-fit: contain;
    position: absolute;
    left: 3px;
    top: 0;
  }

  .title {
    padding-bottom: $padding-set;

    .peotry-set {
      font-size: 18px;
    }
    .peotry-set_dot {
      font-size: 16px;
      padding: 0 5px;
    }
    .peotry-title {
      font-size: 16px;
    }
    .peotry-count {
      margin-left: 15px;
      font-size: 14px;
      i {
        font-size: 20px;
        color: #e6a23c;
        vertical-align: bottom;
      }
    }
  }

  .peot {
    padding-bottom: $padding-set;
    font-size: 14px;
    color: #888888;
    span {
      margin-left: 8px;
    }
  }

  .content-container {
    overflow: hidden;
    box-sizing: border-box;

    .content {
      font-size: $size-content;
      line-height: 26px;
      white-space: pre-wrap;
      box-sizing: border-box;
      padding-bottom: $padding-set;
    }
    .end {
      font-size: 12px;
      color: #333;
      padding-bottom: $padding-set;
    }
  }

  .content-expand {
    font-size: $size-content;

    span {
      cursor: pointer;
      color: rgb(65, 65, 65);
      font-size: 14px;
    }
  }

  .content-expand_shadow {
    box-shadow: 0 -5px 3px 5px rgba(255, 255, 255, 0.15);
  }

  .images {
    padding-bottom: $padding-set;
    margin-top: 16px;
    font-size: 0;
  }

  .peotry-more {
    margin: 5px 0;
    text-align: right;

    .peotry-more_icon {
      font-size: 20px;
      cursor: pointer;

      &:active {
        color: #148acf;
      }
    }
  }

  .comments {
    position: relative;
    margin: 0;
    padding: 5px 10px;
    background-color: rgba(250, 250, 250, 0.5);
    border-radius: 8px;

    .praise-users {
      margin-top: 10px;
      margin-bottom: 5px;
      border-bottom: 1px solid white;
      line-height: 35px;
      user-select: none;

      img {
        width: 30px;
        height: 30px;
        margin-right: 3px;
        cursor: pointer;
        object-fit: contain;

        &:hover {
          background-color: rgba(250, 250, 250, 0.5);
          border-radius: 3px;
        }
      }
    }

    &::before {
      content: "";
      width: 0;
      height: 0;
      position: absolute;
      left: 8px;
      top: -10px;
      border: solid 10px transparent;
      border-bottom-color: rgba(222, 222, 222, 0.2);
      border-top-width: 0;
    }

    .comment {
      padding: 5px 3px;

      .users {
        float: left;
        font-weight: bold;
        margin-right: 8px;

        .user {
          cursor: pointer;

          &:hover {
            color: #148acf;
          }
        }
      }

      .comment_to {
        padding: 0 5px;
        font-weight: initial;
        font-size: 0.9rem;
        color: #555555;
      }

      .comment_dot {
        font-weight: initial;
        font-size: 0.9rem;
        color: #555555;
      }

      p {
        white-space: pre-line;
        word-break: break-all;
      }
    }
  }

  .comment-input {
    text-align: right;
    margin-top: 5px;
    padding-right: 10px;

    .el-button {
      margin-top: 5px;
    }
  }
}

.peotry-row {
  .title,
  .peot {
    display: inline-block;
    margin-right: 20px;
  }
  .content-container {
    .content {
      white-space: normal;
    }
  }
}
</style>

<style lang="scss">
.peotry {
  .images {
    margin: -3px;
    .el-image {
      width: 110px;
      height: 100px;
      margin: 3px;
    }
  }
}
</style>
