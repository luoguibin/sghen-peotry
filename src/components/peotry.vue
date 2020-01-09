<template>
  <div :class="{'peotry': true, 'peotry-peot-icon': hasPeotIcon}">
    <!-- 诗人头像 -->
    <img v-if="hasPeotIcon" class="peot-icon" img-type="user-self" :src="peotry.user | user-icon" />

    <!-- 诗词选集及标题 -->
    <div :class="{'peotry-title': true, 'peotry-inline': titleInline}">
      <span
        v-if="peotry.set"
        class="tooltip peotry-set"
        :tooltip="'选集：' + peotry.set.name"
      >{{peotry.set.name}}</span>
      <span v-if="peotry.set && peotry.title" class="peotry-set_dot">*</span>
      <span class="peotry-title" v-show="peotry.title">{{peotry.title}}</span>
    </div>

    <!-- 诗词点赞数 -->
    <div v-if="showRank" :class="{'peotry-rank': true, 'peotry-inline': titleInline}">
      <span class="peotry-count" v-show="showPraiseCount && praiseComments.length">
      <i class="el-icon-s-data"></i>
      {{praiseComments.length}}
      </span>
      <span @click="onCommentPraise(true)" class="rank-praise">
        <i :class="[isPraise ? 'el-icon-star-on' : 'el-icon-star-off']"></i>
      </span>
    </div>

    <!-- 诗词作者及创建时间 -->
    <div :class="{'peot-name': true, 'peotry-inline': titleInline}">
      <template v-if="titleInline">
        {{peotry.user ? '--' + peotry.user.name : ""}}
        <span v-if="showTime">于{{peotry.time | time-format}}</span>
      </template>
      <template v-else>
        {{peotry.user ? peotry.user.name : ""}}
        <span v-if="showTime">--{{peotry.time | time-format}}</span>
      </template>
    </div>

    <!-- `white-wrap: pre-wrap` and code's format -->
    <!-- 诗词内容 -->
    <div class="content-container" ref="contentEl" :style="{height: contentHeight}">
      <div :class="{'content': true }" v-html="peotry.content"></div>
      <div class="end" v-if="peotry.end">{{peotry.end}}</div>
    </div>

    <!-- 诗词扩展按钮 -->
    <div v-if="canExpand" class="content-expand">
      <p v-show="contentHeight !== 'initial'">...</p>
      <span @click="onClickExpand">{{contentHeight === 'initial' ? '收起' : expandText}}</span>
    </div>

    <!-- 诗词图片 -->
    <div v-if="showImage && peotryImages.length" class="images">
      <el-image v-for="value in peotryImages" :key="value"
        :src="value" :fit="`cover`" :preview-src-list="peotryImages" :scroll-container="mainScrollBox" lazy>
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
    </div>

    <!-- 诗词功能按钮 -->
    <div v-show="showMore" class="peotry-more">
      <template v-if="showMoreDirect">
        <el-button type="text" :icon="isPraise ? 'el-icon-star-on' : 'el-icon-star-off'"
          @click="onCommandMore('praise')">{{isPraise ? "取消点赞" : "点赞"}}</el-button>
        <!-- 冒泡事件会触发其他区域点击从而隐藏输入框？ -->
        <el-button type="text" icon="el-icon-chat-dot-square"
          @click.stop="onCommandMore('comment')">评论</el-button>
      </template>
      <el-dropdown v-else @command="onCommandMore" trigger="click">
        <i class="peotry-more_icon el-icon-more-outline"></i>

        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="comment">
            <span>
              评论
              <i class="el-icon-chat-dot-square"></i>
            </span>
          </el-dropdown-item>

          <el-dropdown-item command="praise">
            <span>
              {{isPraise ? "取消点赞" : "点赞"}}
              <i
                :class="[isPraise ? 'el-icon-star-on' : 'el-icon-star-off']"
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

    <!-- 诗词评论 -->
    <div v-if="showComment && peotry.comments && peotry.comments.length" class="comments">
      <div class="praise-users" v-show="praiseComments.length">
        <img
          v-for="comment in praiseComments"
          :key="comment.id"
          :img-type="'user-' + comment.fromId"
          :src="comment.fromUser | user-icon"
        />
      </div>

      <div v-show="praiseComments.length && realComments.length" class="comments-divider"></div>

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

    <!-- 诗词评论输入框 -->
    <div v-if="inComment" class="comment-input">
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
import { imagePrefixxPath } from '@/api/config'
import {
  createComment,
  deleteComment
} from '@/api'

export default {
  props: {
    peotry: {
      type: Object,
      required: true
    },

    /**
     * 是否有
     */
    hasPeotIcon: {
      type: Boolean,
      default: true
    },

    /**
     * 标题和作者内联排列
     */
    titleInline: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示点赞数
     */
    showPraiseCount: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示创建时间
     */
    showTime: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示评论
     */
    showComment: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示图片
     */
    showImage: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示更多操作
     */
    showMore: {
      type: Boolean,
      default: false
    },

    /**
     * 是否直接展示操作按钮
     */
    showMoreDirect: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示排行
     */
    showRank: {
      type: Boolean,
      default: false
    },

    /**
     * 扩展按钮
     */
    expandText: {
      type: String,
      default: '展开全文'
    }
  },
  data () {
    return {
      showDelete: false,
      inComment: false,
      clickTime: 0,
      canExpand: false,
      contentHeight: 'initial',
      imagePrefixxPath,
      mainScrollBox: null
    }
  },
  inject: ['userMap'],
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
            return imagePrefixxPath + v.substr(1)
          } else {
            return imagePrefixxPath + v
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
    isPraise () {
      return this.myPraiseComment && this.myPraiseComment.content === 'praise'
    },

    ...mapState({
      userInfo: state => state.user
    })
  },
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
        this.setOutClick(true)
      })
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
              this.onCommentDelete(commentId)
            })
            .catch(e => {})
        }
      }
    },
    onCommentPraise (needEmit) {
      if (!this.userInfo.token) {
        this.$message.warning('请登录后再操作')
        return
      }
      this.checkComment(-1)

      if (this.isPraise) {
        this.onCommentDelete(this.myPraiseComment.id, needEmit)
      } else {
        this.peotry.comment.content = 'praise'
        this.onCommentSubmit(needEmit)
      }
    },
    /**
     * 提交诗词评论
     */
    onCommentSubmit (needEmit) {
      createComment(this.peotry.comment).then(resp => {
        const comment = resp.data.data
        this.addComment(comment)
        this.$emit('update', { type: 'comment-create', isPraise: comment.toId === -1 })
      })

      this.setOutClick(false)
      this.inComment = false
    },
    /**
     * 添加诗词本地评论
     */
    addComment (comment) {
      comment.fromUser = this.userMap[comment.fromId]
      if (!this.peotry.comments) {
        this.$set(this.peotry, 'comments', [])
      }
      window.testPeotry = this
      this.peotry.comments.push(comment)
    },
    /**
     * 删除某条评论
     * @param {Integer} id 评论对象id
     * @param {Boolean} needEmit 是否需要抛出事件
     */
    onCommentDelete (id, needEmit) {
      deleteComment({ id, fromId: this.userInfo.id }).then(resp => {
        const index = this.peotry.comments.findIndex(o => o.id === id)
        const comment = this.peotry.comments.splice(index, 1)[0]
        this.$emit('update', {
          type: 'comment-delete',
          peotryId: this.peotry.id,
          isPraise: comment.toId === -1
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
$size-content: 18px;
$padding-set: 12px;

.peotry {
  position: relative;

  .peot-icon {
    width: 26px;
    height: 26px;
    object-fit: contain;
    position: absolute;
    left: 3px;
    top: 0;
  }

  .peotry-title {
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
  }
  .peotry-title.peotry-inline {
    margin-right: 10px;
  }

  .peotry-rank {
    padding: 2px 5px;
    background-color: #eeeeee;

    .peotry-count {
      font-size: 14px;
      i {
        font-size: 20px;
        color: #a4c8ff;
        vertical-align: bottom;
      }
    }
    .rank-praise {
      cursor: pointer;
      margin-left: 8px;
      .el-icon-star-on {
        font-size: 15px;
        color: #e6a23c;
      }
      .el-icon-star-off {
        font-size: 15px;
      }
    }
  }

  .peot-name {
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
      word-break: break-all;
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
      color: rgb(112, 112, 112);
      font-size: 14px;
    }
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
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 8px;

    .comments-divider {
      border-bottom: 1px solid white;
    }

    .praise-users {
      user-select: none;

      img {
        width: 30px;
        height: 30px;
        margin-right: 3px;
        cursor: pointer;
        object-fit: contain;

        &:hover {
          background-color: rgba(250, 250, 250, 0.8);
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
      border-bottom-color: rgba(0, 0, 0, 0.1);
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
        line-height: 21px;
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

  .peotry-inline {
    display: inline-block;
  }
}

.peotry-peot-icon {
  padding-left: 38px;
}

</style>

<style lang="scss">
.peotry {
  .images {
    margin: -3px;
    .el-image {
      width: 90px;
      height: 80px;
      margin: 3px;
      .image-slot {
        font-size: 25px;
      }
    }
  }
}
</style>
