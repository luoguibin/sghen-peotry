<template>
  <el-container id="app">
    <el-header>
      <page-header></page-header>
    </el-header>

    <el-main ref="main">
      <el-scrollbar ref="scrollbar">
        <div>
          <router-view />
        </div>
        <page-footer ref="footer"></page-footer>
      </el-scrollbar>
    </el-main>
  </el-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'app',

  data () {
    return {
      userMap: {}
    }
  },

  provide () {
    return {
      userMap: this.userMap
    }
  },

  mounted () {
    window.app = this
    this.initResize()
    if (this.$route.query.login_direct) {
      this.showLogin()
    }
  },

  watch: {
    scrollTopCount () {
      const scrollbar = this.$refs.scrollbar
      if (!scrollbar) {
        return
      }
      scrollbar.$refs.wrap.scrollTop = 0
    }
  },

  computed: {
    ...mapState({
      scrollTopCount: state => state.scrollTopCount
    })
  },

  methods: {
    initResize () {
      this.resize = () => {
        const footer = this.$refs.footer.$el
        const target = (footer || {}).previousElementSibling
        if (!target) {
          return
        }
        const main = this.$refs.main.$el
        const minHeight = main.clientHeight - footer.clientHeight
        target.style.minHeight = Math.max(minHeight, 300) + 'px'

        let type
        if (main.clientWidth > 800) {
          type = 'screen-large'
        } else if (main.clientWidth > 500) {
          type = 'screen-middle'
        } else {
          type = 'screen-small'
        }
        this.setScreenType(type)
      }

      window.addEventListener('resize', this.resize)
      this.resize()
    },

    ...mapActions(['showLogin', 'setScreenType'])
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.resize)
  }
}
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

.el-main {
  padding: 0;
  min-height: 500px;
  height: 100%;
}

.el-header {
  background-color: rgba(222, 222, 222, 0.2);
  box-shadow: 0 0 3px 3px rgba(222, 222, 222, 0.8);
}
}
</style>
