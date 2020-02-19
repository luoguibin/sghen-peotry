<template>
  <div class="music-box">
    <aplayer :music="music" autoplay></aplayer>
  </div>
</template>

<script>
import Aplayer from 'vue-aplayer'

export default {
  name: 'MusicBox',

  components: {
    Aplayer
  },

  data() {
    return {
      music: {
        title: '徐鲤 - 镜湖',
        artist: 'Silent Siren',
        src: require('@/assets/music/徐鲤 - 镜湖.mp3'),
        pic: require('@/assets/img/icon.png')
      }
    }
  },

  created() {
    window.musicBox = this
  }
}
</script>

<style lang="scss" scoped>
.music-box {
  .aplayer {
    margin: 0 0 5px 0;
  }
}
</style>