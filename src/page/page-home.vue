<template>
  <div class="page-home">
    <div class="sg-container">
      <!-- 轮播卡片 -->
      <el-carousel
        v-if="carouselItems && carouselItems.length"
        :interval="4000"
        :type="carouselType"
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
          <div class="board-list board-top-3">
            <h3>
              {{boards[0].name}}
              <el-button v-if="boards[0].hasMore" type="text" @click="onPeotryMore" class="peotry-more">更多</el-button>
            </h3>
            <div v-loading="boards[0].isLoading">
              <peotry v-for="peotry in boards[0].list" :key="peotry.id"
                :peotry="peotry" :showComment="false"></peotry>
            </div>
          </div>

          <!-- 最新诗词 -->
          <div class="board-latest-list">
            <h3>
              {{boards[1].name}}
              <el-button v-if="boards[1].hasMore" type="text" @click="onPeotryMore" class="peotry-more">更多</el-button>
            </h3>
            <div v-loading="boards[1].isLoading">
              <el-timeline>
                <el-timeline-item v-for="peotry in boards[1].list" :key="peotry.id"
                  :timestamp="peotry.time | time-format"  type="success" placement="top">
                  <el-card>
                    <peotry :peotry="peotry" :titleInline="true" :showTime="false"></peotry>
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

  .board-list {
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
      @media screen and (min-width: 600px) {
        width: 50%;
      }
      @media screen and (min-width: 900px) {
        width: 33%;
      }
      @media screen and (min-width: 1680px) {
        width: 33%;
      }
      @media screen and (min-width: 1900px) {
         width: 25%;
      }
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
  .board-latest-list {
    padding: 10px;
    margin-top: 25px;
    h3 {
      padding-bottom: 10px;
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
  background-color: rgb(225, 255, 232);
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: rgb(209, 224, 255);
}

@media screen and (max-width: 500px) {
  .page-home {
    .board-list /deep/.peotry {
      margin: 0 10px 50px 0;
    }
  }
}
</style>

<style lang="scss">
.page-home {
  .board-latest-list {
    .el-card__body {
      padding: 20px 20px 20px 5px;
    }
  }
}
</style>
