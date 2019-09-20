<template>
  <div class="page-footer">
    {{authYear}} / Sghen三行 / <a href="http://beian.miit.gov.cn" target="_blank">粤ICP备19116971号-1</a>
  </div>
</template>

<script>
export default {
  name: 'page-footer',

  computed: {
    authYear () {
      return '©2019-' + new Date().getFullYear()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-footer {
  text-align: center;
  padding: 20px 0 10px 0;
  color: #c8c8c8;

  a:visited {
    color: inherit;
  }

  a:hover {
    color: #8d8d8d;
  }
}
</style>
