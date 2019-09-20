<template>
  <el-container id="app">
    <el-header>
      <page-header></page-header>
    </el-header>

    <el-main>
      <el-scrollbar>
        <router-view />
        <page-footer></page-footer>
      </el-scrollbar>
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.el-main {
  padding: 0;
  min-height: 500px;
  height: 100%;
}

.el-header {
  background-color: rgba(222, 222, 222, 0.2);
  box-shadow: 0 0 3px 3px rgba(222, 222, 222, 0.8);
}
</style>

<style>
* {
  padding: 0;
  margin: 0;
}

html,
body {
  height: 100%;
}

#app {
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.el-scrollbar {
  height: 100%;
}

.el-scrollbar .el-scrollbar__wrap {
  overflow-x: hidden;
  margin-bottom: 0 !important;
}
</style>
