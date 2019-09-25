<template>
  <div class="page-home">
    <el-carousel :interval="4000" :type="carouselType" height="200px">
      <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
        <h3 class="medium" @click="onClickCarousel(item)">{{ item.label }}</h3>
        <component v-if="item.comp" :is="item.comp"></component>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "page-home",

  components: {
    "carousel-peotry": () => import("./carousel-peotry")
  },

  data() {
    return {
      carouselItems: [
        {
          label: "Sghen诗词",
          comp: "carousel-peotry",
          local: true,
          target: { name: "peotry-list" }
        },
        { label: "wiki大法好", local: false, target: "http://wiki.sghen.cn" },
        {
          label: "Sghen-World",
          local: false,
          target: "http://www.sghen.cn/game/index.html"
        }
      ],
      carouselType: ""
    };
  },

  created() {
    this.showBack(false);
  },

  watch: {
    screenType() {
      if (this.screenType === "screen-large") {
        this.carouselType = "card";
      } else {
        this.carouselType = "";
      }
    }
  },

  computed: {
    ...mapState({
      screenType: state => state.screenType
    })
  },

  methods: {
    onClickCarousel(item) {
      if (item.local) {
        this.$router.push(item.target);
      } else {
        window.open(item.target, "_blank");
      }
    },

    ...mapActions({
      showBack: "showBack"
    })
  }
};
</script>

<style scoped>
.page-home {
  position: relative;
  min-height: inherit;
  box-sizing: border-box;
  background-image: repeating-linear-gradient(
    rgba(44, 42, 165, 0.26),
    rgba(42, 165, 52, 0.26)
  );
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
