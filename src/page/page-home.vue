<template>
  <div class="page-home">
    <div>
      <el-button type="text" @click="onPagePeotryList">Sghen诗词</el-button>
      <el-button type="text" @click="onPageWiki">wiki大法好</el-button>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "page-home",

  created() {
    this.showBack(false);
  },

  methods: {
    onPagePeotryList() {
      this.$router.push({ name: "peotry-list" });
    },

    onPageWiki() {
      window.open("http://wiki.sghen.cn", '_blank')
    },

    ...mapActions({
      showBack: "showBack"
    })
  }
};
</script>

<style scoped>
.page-home {
  text-align: center;
  min-height: 300px;
  padding-top: 30px;
}
</style>
