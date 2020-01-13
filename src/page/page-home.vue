<template>
  <div class="page-home">
    <div class="sg-container">
      <!-- 轮播卡片 -->
      <el-carousel
        v-if="carouselItems && carouselItems.length"
        :interval="4000"
        :type="carouselType"
        height="260px"
        indicator-position="outside"
      >
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <div class="sg-flex sg-flex-column">
            <h3>{{ item.label }}</h3>

            <div v-if="item.comp === 'peotry'" class="carousel-peotry sg-flex-main">
              <div v-if="peotry" class="peotry-content" v-html="peotry.content"></div>
            </div>
            <div v-else class="carousel-description sg-flex-main" v-html="item.content || ''"></div>

            <div style="text-align: right; padding: 10px 30px;">
              <el-button type="text" icon="el-icon-link" @click="onClickCarousel(item)">demo试玩</el-button>
              <el-button v-if="item.gayhub" type="text" @click="onClickCarousel(item, 'gayhub')">
                <img style="width: 14px" :src="require('@/assets/img/icon-github.svg')" />
                github砖头
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>

      <div class="ph-box">
        <!-- 诗词主区域 -->
        <div class="ph-main">
          <!-- 热门诗词 -->
          <div class="board-hot-list board-top-3">
            <h3>
              {{boards[0].name}}
              <el-button v-if="boards[0].hasMore" type="text" @click="onPeotryMore" class="peotry-more">更多</el-button>
            </h3>
            <div v-loading="boards[0].isLoading">
              <peotry v-for="peotry in boards[0].list" :key="peotry.id"
                :peotry="peotry" :titleInline="true" :showComment="false" :showRank="true"
                  @update="onUpdatePeotry($event, 0)"></peotry>
            </div>
          </div>

          <!-- 最新诗词 -->
          <div class="board-latest-list">
            <h3 ref="latestAnchor">
              {{boards[1].name}}
              <el-button type="text" icon="el-icon-refresh-left" @click="queryPeotries(false, true)"></el-button>
              <el-button v-if="boards[1].hasMore" class="peotry-more"
                type="text" @click="onPeotryMore">更多</el-button>
            </h3>
            <div v-loading="boards[1].isLoading">
              <el-timeline>
                <el-timeline-item v-for="peotry in boards[1].list" :key="peotry.id"
                  :timestamp="peotry.time | time-format"  type="success" placement="top">
                  <el-card>
                    <peotry :peotry="peotry" :titleInline="true" :showTime="false" :showMore="true"
                      :showMoreDirect="true" @update="onUpdatePeotry($event, 1)"></peotry>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </div>

        <!-- 右侧诗词概况面板 -->
        <peotry-word-cloud class="ph-float"></peotry-word-cloud>
      </div>
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

      peotry: null
    }
  },

  created () {
    this.showBack(false)
    this.getCarousels()
    this.queryPeotries()
    this.queryPopularPeotries()
    window.home = this
  },

  watch: {
    userInfo (e) {
      this.updatePeotriesData()
    },
    screenType: {
      immediate: true,
      handler () {
        if (this.screenType === 'screen-large') {
          this.carouselType = 'card'
        } else {
          this.carouselType = ''
        }
      }
    },
    peotryOption: {
      deep: true,
      handler (e) {
        if (e.type === 'success') {
          this.$refs.latestAnchor.scrollIntoView()
          this.queryPeotries(false, true)
        }
      }
    }
  },

  computed: {
    ...mapState({
      userInfo: state => state.user,
      screenType: state => state.screenType,
      peotryOption: state => state.peotryOption
    })
  },

  methods: {
    getCarousels () {
      import('@/assets/config/carousels.json').then(o => {
        this.carouselItems = o.default
      })
    },

    queryPeotries (hideLoading, isSkip) {
      if (!isSkip) {
        queryPeotries({ setId: 10001 }).then(({ data }) => {
          const index = Math.floor(Math.random() * data.data.length)
          this.peotry = data.data[index]
        })
      }

      if (!hideLoading) {
        this.boards[1].isLoading = true
      }
      queryPeotries({ limit: 5, needComment: true })
        .then(({ data }) => {
          this.boards[1].list = data.data
          this.updatePeotriesData()
        })
        .finally(() => {
          this.boards[1].isLoading = false
        })
    },

    queryPopularPeotries (hideLoading) {
      if (!hideLoading) {
        this.boards[0].isLoading = true
      }
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
          const userMap = {}
          resp.data.data.forEach(user => {
            userMap[user.id] = user
          })

          this.boards.forEach(board => {
            board.list.forEach(peotry => {
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
        })
      }
    },

    /**
     * 更新列表中的诗词，例如点赞、评论操作
     * @param {Object} e 操作对象
     * @param {Integer} index 列表下标
     */
    onUpdatePeotry (e, index) {
      switch (e.type) {
        case 'comment-create':
        case 'comment-delete':
          if (e.isPraise) {
            // 当点赞数超过一定数量时，最新诗词列表的点赞不影响热门诗词列表
            // 前期直接刷新所有
            this.queryPopularPeotries(true)
            this.queryPeotries(true, true)
          }
          break
        default:
          break
      }
    },

    onClickCarousel (item, key) {
      if (key && item[key]) {
        window.open(item[key], '_blank')
        return
      }
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
  background-color: #fafafa;

  .carousel-peotry {
    text-align: center;

    .peotry-content {
      white-space: pre-wrap;
      word-break: break-all;
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

  .ph-box {
    position: relative;
    overflow: hidden;
    .ph-main {
      float: left;
      width: calc(100% - 420px);
      margin-right: 20px;
      @media screen and (max-width: 1200px) {
        width: 100%;
        margin-right: 0;
      }
    }
    .ph-float {
      float: left;
      width: 400px;
      @media screen and (max-width: 1200px) {
        width: 100%;
        margin-top: 25px;
      }
    }
  }

  .board-hot-list {
    background-color: white;
    border: 1px solid #eeeeee;
    h3 {
      padding: 10px;
    }

    > div {
      padding: 24px 16px;
      min-height: 200px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-content: space-between;
      border-radius: 8px;
    }

    /deep/ .peotry {
      width: 100%;
      box-sizing: border-box;
      margin-bottom: 20px;
      @media screen and (min-width: 700px) {
        padding-right: 10px;
        width: 50%;
      }
      @media screen and (min-width: 1680px) {
        padding-right: 10px;
        width: 33%;
      }
    }

    h3 {
      padding: 10px;
      text-align: left;
    }
  }
  .board-latest-list {
    padding: 10px;
    margin-top: 25px;
    h3 {
      padding-bottom: 10px;
    }
  }

  .board-top-3 /deep/ .peotry {
    &:nth-child(2) {
      .peotry-rank .peotry-count {
        color: rgb(187, 47, 47);
        font-weight: bold;
        i {
          color: inherit;
        }
      }
    }
    &:nth-child(3) {
      .peotry-rank .peotry-count {
        color: rgb(19, 109, 19);
        font-weight: bold;
        i {
          color: inherit;
        }
      }
    }
    &:nth-child(4) {
      .peotry-rank .peotry-count {
        color: rgb(63, 63, 219);
        font-weight: bold;
        i {
          color: inherit;
        }
      }
    }
  }

  .peotry-more {
    float: right;
    margin-top: -5px;
  }
}
</style>

<style lang="scss">
.page-home {
  .el-carousel {
    padding: 10px;

    .el-carousel__item {
      border-radius: 5px;
    }

    .el-carousel__item h3 {
      padding: 25px;
      cursor: pointer;
      color: #475669;
      text-align: center;
    }

    .el-carousel__item:nth-child(2n) {
      background-color: rgb(210, 255, 220);
    }

    .el-carousel__item:nth-child(2n + 1) {
      background-color: rgb(211, 226, 255);
    }
  }

  .board-latest-list {
    .el-card__body {
      padding: 20px 20px 20px 5px;
    }
  }
}
</style>
