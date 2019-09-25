<template>
  <div class="page-home">
    <el-carousel :interval="4000" :type="carouselType">
      <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
        <h3 class="medium" @click="onClickCarousel(item)">{{ item.label }}</h3>

        <template v-if="item.comp">
          <div v-if="item.comp === 'peotry'" class="carousel-peotry">
            <div v-if="peotry" class="content" v-html="peotry.content"></div>
          </div>
        </template>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { queryPeotries } from '@/api'

export default {
  name: 'page-home',

  data () {
    return {
      carouselItems: [
        {
          label: 'Sghen诗词',
          comp: 'peotry',
          local: true,
          target: { name: 'peotry-list' }
        },
        { label: 'wiki大法好', local: false, target: 'http://wiki.sghen.cn' },
        {
          label: 'Sghen-World',
          local: false,
          target: 'http://www.sghen.cn/game/index.html'
        }
      ],
      carouselType: 'card',

      peotry: null
    }
  },

  created () {
    this.showBack(false)
    this.queryPeotries()
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
    queryPeotries () {
      queryPeotries({ setId: 10001 }).then(({ data }) => {
        const index = Math.floor(Math.random() * data.data.length)
        this.peotry = data.data[index]
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

    .content {
      white-space: pre-wrap;
      display: inline-block;
    }
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
