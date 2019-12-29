<template>
  <div class="page-home">
    <div class="sg-container">
      <el-carousel
        v-if="carouselItems && carouselItems.length"
        :interval="4000"
        :type="carouselType"
      >
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <h3 class="medium">{{ item.label }}</h3>

          <template v-if="item.comp">
            <div v-if="item.comp === 'peotry'" class="carousel-peotry">
              <div v-if="peotry" class="peotry-content" v-html="peotry.content"></div>
            </div>
          </template>
          <div v-else class="carousel-description" v-html="item.content || ''"></div>
          <div style="text-align: right; padding-right: 50px;">
            <el-button type="text" icon="el-icon-link" @click="onClickCarousel(item)">传送门</el-button>
          </div>
        </el-carousel-item>
      </el-carousel>

      <peotry-word-cloud></peotry-word-cloud>

      <div v-for="board in boards" :key="board.key"
        :class="{'board-list': true, 'board-top-3': board.key === 'hot' }"
        @click="onClickImage($event)"
      >
        <h3>
          {{board.name}}
          <el-button v-if="board.hasMore" type="text" @click="onPeotryMore" class="peotry-more">更多</el-button>
        </h3>
        <div v-loading="board.isLoading">
          <peotry v-for="peotry in board.list" :key="peotry.id" :peotry="peotry" :is-detail="false"></peotry>
        </div>
      </div>

      <!-- todo:重复代码优化 -->
      <el-dialog title="图片" :visible.sync="showImage" class="show-image" :show-close="false" center>
        <el-image :src="showImageUrl">
          <div slot="error" class="image-error-slot">
            <i class="el-icon-picture-outline"></i>
            <p>图片加载失败</p>
          </div>
        </el-image>

        <div v-if="curImgEl" class="show-image_btns">
          <el-button type="text" v-show="curImgEl.previousElementSibling" @click="onClickNearImage(false)">上一张</el-button>
          <el-button type="text" v-show="curImgEl.nextElementSibling" @click="onClickNearImage(true)">下一张</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { queryUsers, queryPeotries, queryPopularPeotries } from '@/api'

export default {
  name: 'page-home',

  components: {
    peotry: () => import('@/components/peotry'),
    'peotry-word-cloud': () => import('@/components/peotry-word-cloud')
  },

  data () {
    return {
      carouselItems: [],
      carouselType: 'card',

      boards: [
        {
          key: 'hot',
          name: '热门诗词',
          isLoading: false,
          list: []
        },
        {
          key: 'latest',
          name: '最新诗词',
          isLoading: false,
          hasMore: true,
          list: []
        }
      ],

      peotry: null,

      showImage: false,
      showImageUrl: '',
      curImgEl: null
    }
  },

  created () {
    this.showBack(false)
    this.getCarousels()
    this.queryPeotries()
    this.queryPopularPeotries()
    window.home = this
  },

  inject: ['userMap'],

  watch: {
    screenType: {
      immediate: true,
      handler () {
        if (this.screenType === 'screen-large') {
          this.carouselType = 'card'
        } else {
          this.carouselType = ''
        }
      }
    }
  },

  computed: {
    ...mapState({
      screenType: state => state.screenType
    })
  },

  methods: {
    getCarousels () {
      import('@/assets/config/carousels.json').then(o => {
        this.carouselItems = o.default
      })
    },

    queryPeotries () {
      queryPeotries({ setId: 10001 }).then(({ data }) => {
        const index = Math.floor(Math.random() * data.data.length)
        this.peotry = data.data[index]
      })

      this.boards[1].isLoading = true
      queryPeotries({ limit: 5, needComment: true })
        .then(({ data }) => {
          this.boards[1].list = data.data
          this.updatePeotriesData()
        })
        .finally(() => {
          this.boards[1].isLoading = false
        })
    },

    queryPopularPeotries () {
      this.boards[0].isLoading = true
      queryPopularPeotries({ limit: 5 })
        .then(({ data }) => {
          this.boards[0].list = data.data
          this.updatePeotriesData()
        })
        .finally(() => {
          this.boards[0].isLoading = false
        })
    },

    updatePeotriesData () {
      const boards = this.boards
      if (boards.some(o => o.list.length === 0)) {
        return
      }
      let datas = []
      this.boards.forEach(o => {
        datas = [...datas, ...o.list]
      })

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
          this.boards.forEach(board => {
            board.list.forEach(peotry => {
              if (peotry.comments && peotry.comments.length) {
                peotry.comments = peotry.comments.map(comment => {
                  comment.fromUser = userMap[comment.fromId]
                  return comment
                })
              }
            })
          })
        })
      }
    },

    onClickImage (e) {
      const el = e.srcElement
      if (el.tagName === 'IMG') {
        const imgType = el.getAttribute('img-type')
        if (imgType === 'picture') {
          this.showImageUrl = el.getAttribute('src')
          this.curImgEl = el
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

    onClickNearImage (isNext) {
      if (!this.curImgEl) {
        return
      }
      const el = isNext ? this.curImgEl.nextElementSibling : this.curImgEl.previousElementSibling
      if (!el) {
        return
      }
      this.curImgEl = el
      this.showImageUrl = el.getAttribute('src')
    },

    onClickCarousel (item) {
      if (item.local) {
        this.$router.push(item.target)
      } else {
        window.open(item.target, '_blank')
      }
    },

    onPeotryMore () {
      this.$router.push({ name: 'peotry-list' })
    },

    ...mapActions({
      showBack: 'showBack'
    })
  }
}
</script>

<style lang="scss" scoped>
.page-home {
  position: relative;
  min-height: inherit;
  box-sizing: border-box;
  background-color: white;

  .carousel-peotry {
    text-align: center;

    .peotry-content {
      white-space: pre-wrap;
      line-height: 26px;
    }
  }

  .carousel-description {
    max-width: 300px;
    padding: 20px;
    margin: 0 auto;
    text-indent: 2em;
    color: #787878;
    font-size: 18px;
    line-height: 1.5em;
  }

  .board-list {
    padding: 10px;
    margin: 0 auto;

    h3 {
      padding: 10px;
      border-bottom: 1px solid #66b1ff;
      margin-bottom: 10px;
    }

    > div {
      padding: 24px 16px;
      min-height: 200px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-content: space-between;
      border-radius: 8px;
      background-color: #f5faff;
    }

    /deep/ .peotry {
      width: 100%;
      max-width: 310px;
      margin: 0 15px 50px;
      box-sizing: border-box;
    }

    h3 {
      padding: 10px;
      text-align: left;
    }

    .title {
      padding-bottom: 8px;
      font-weight: bold;

      span {
        &:nth-child(1) {
          font-size: 16px;
        }
        &:nth-child(2) {
          font-size: 14px;
          padding: 0 5px;
        }
        &:nth-child(3) {
          font-size: 14px;
        }
      }
    }
  }

  .board-top-3 /deep/ .peotry {
    &:nth-child(2) {
      .title .peotry-count {
        color: rgb(187, 47, 47);
        font-weight: bold;
      }
    }
    &:nth-child(3) {
      .title .peotry-count {
        color: rgb(19, 109, 19);
        font-weight: bold;
      }
    }
    &:nth-child(4) {
      .title .peotry-count {
        color: rgb(63, 63, 219);
        font-weight: bold;
      }
    }
  }

  .peotry-more {
    float: right;
    margin-top: -5px;
  }
}

.el-carousel {
  padding: 10px;
}

.el-carousel__item {
  border-radius: 5px;
}

.el-carousel__item h3 {
  padding: 30px;
  cursor: pointer;
  color: #475669;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #e3f1ff;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #f5faff;
}

@media screen and (max-width: 500px) {
  .page-home {
    .board-list /deep/.peotry {
      margin: 0 10px 50px 0;
    }
  }
}
</style>
