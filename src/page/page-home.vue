<template>
  <div class="page-home">
    <div class="sg-container">
      <el-carousel
        v-if="carouselItems && carouselItems.length"
        :interval="4000"
        :type="carouselType"
      >
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <h3 class="medium" @click="onClickCarousel(item)">{{ item.label }}</h3>

          <template v-if="item.comp">
            <div v-if="item.comp === 'peotry'" class="carousel-peotry">
              <div v-if="peotry" class="peotry-content" v-html="peotry.content"></div>
            </div>
          </template>
        </el-carousel-item>
      </el-carousel>

      <div v-for="board in boards" :key="board.key" class="peotry-list">
        <h3>
          {{board.name}}
          <el-button v-if="board.hasMore" type="text" @click="onPeotryMore" class="peotry-more">更多</el-button>
        </h3>
        <div v-loading="board.isLoading">
          <peotry v-for="peotry in board.list" :key="peotry.id" :peotry="peotry" :is-detail="false"></peotry>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { queryPeotries, queryPopularPeotries } from '@/api'

export default {
  name: 'page-home',

  components: {
    peotry: () => import('@/components/peotry')
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

      this.boards[0].isLoading = true
      queryPeotries({ limit: 5 })
        .then(({ data }) => {
          this.boards[0].list = data.data
        })
        .finally(() => {
          this.boards[0].isLoading = false
        })
    },

    queryPopularPeotries () {
      this.boards[1].isLoading = true
      queryPopularPeotries({ limit: 5 })
        .then(({ data }) => {
          this.boards[1].list = data.data
        })
        .finally(() => {
          this.boards[1].isLoading = false
        })
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
  background-image: repeating-linear-gradient(
    rgba(44, 42, 165, 0.26),
    rgba(42, 165, 52, 0.26)
  );

  .carousel-peotry {
    text-align: center;

    .peotry-content {
      white-space: pre-wrap;
      line-height: 26px;
    }
  }

  .peotry-list {
    padding: 10px;
    margin: 0 auto;

    h3 {
      border-bottom: 1px solid white;
      margin-bottom: 20px;
    }

    > div {
      min-height: 200px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-content: space-between;
    }

    /deep/.peotry {
      max-width: 500px;
      margin: 0 20px 50px 20px;
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
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
