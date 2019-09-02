<template>
  <div id="app">
      <router-view />
  </div>
</template>

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
}
</style>
