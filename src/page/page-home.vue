<template>
  <div class="page-home">
    <div class="animate_box">
      <el-button type="text" @click="onPagePeotryList">Sghen诗词</el-button>
      <el-button type="text" @click="onPageWiki">wiki大法好</el-button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'page-home',

  created () {
    this.showBack(false)
  },

  methods: {
    onPagePeotryList () {
      this.$router.push({ name: 'peotry-list' })
    },

    onPageWiki () {
      window.open('http://wiki.sghen.cn', '_blank')
    },

    ...mapActions({
      showBack: 'showBack'
    })
  }
}
</script>

<style scoped>
.page-home {
  position: relative;
  min-height: inherit;
  box-sizing: border-box;
  background-image: repeating-linear-gradient(rgba(44, 42, 165, 0.26), rgba(42, 165, 52, 0.26));
}

.animate_box {
  position: absolute;
  width: 95%;
  top: 20px;
  left: 0;
  right: 0;
  line-height: 100px;
  margin: 0 auto;
  text-align: center;
  height: 120px;
}
</style>
