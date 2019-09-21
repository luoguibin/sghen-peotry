<template>
  <div class="page-home">
    <el-button type="text" @click="onPagePeotryList">Sghen诗词</el-button>
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

    ...mapActions({
      showBack: 'showBack'
    })
  }
}
</script>

<style scoped>
.page-home {

}
</style>
