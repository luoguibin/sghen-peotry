<template>
  <div class="page-home">
    <el-button type="text" @click="onPagePeotryList">Sghen诗词</el-button>
  </div>
</template>

<script>
export default {
  name: 'page-home',

  methods: {
    onPagePeotryList () {
      this.$router.push({ name: 'peotry-list' })
    }
  }
}
</script>

<style scoped>
.page-home {

}
</style>
