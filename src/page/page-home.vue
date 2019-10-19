<template>
  <div class="page-home">
    <el-carousel v-if="carouselItems && carouselItems.length" :interval="4000" :type="carouselType">
      <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
        <h3 class="medium" @click="onClickCarousel(item)">{{ item.label }}</h3>

        <template v-if="item.comp">
          <div v-if="item.comp === 'peotry'" class="carousel-peotry">
            <div v-if="peotry" class="peotry-content" v-html="peotry.content"></div>
          </div>
        </template>
      </el-carousel-item>
    </el-carousel>

    <div class="peotry-popular">
      <h3>热门诗词</h3>
      <div v-for="peotry in peotries" :key="peotry.id">
        <div class="title">
          <span
            v-if="peotry.set"
            class="tooltip"
            :tooltip="'选集：' + peotry.set.name"
          >{{peotry.set.name}}</span>
          <span v-if="peotry.set && peotry.title">*</span>
          <span>{{peotry.title}}</span>
        </div>
        <div class="peotry-content" v-html="peotry.content"></div>
        <el-divider></el-divider>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { queryPeotries, queryPopularPeotries } from '@/api'

export default {
  name: 'page-home',

  data () {
    return {
      carouselItems: [],
      carouselType: 'card',

      peotry: null,
      peotries: []
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
    },

    queryPopularPeotries () {
      queryPopularPeotries().then(({ data }) => {
        this.peotries = data.data
      })
    },

    onClickCarousel (item) {
      if (item.local) {
        this.$router.push(item.target)
      } else {
        window.open(item.target, '_blank')
      }
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
  }

  .peotry-popular {
    max-width: 500px;
    overflow: hidden;
    text-align: center;
    margin: 0 auto;

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

  .peotry-content {
    text-align: left;
    white-space: pre-wrap;
    display: inline-block;
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
