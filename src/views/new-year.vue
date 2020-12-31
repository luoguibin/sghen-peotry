<template>
  <div class="new-year">
    <div style="padding: 20px; font-size: 18px; text-align: center;" v-show="yearMonthDate === '2021-1-1'">2021~元旦快乐</div>
  </div>
</template>

<script>
export default {
  name: 'NewYear',

  data() {
    return {
      yearMonthDate: ''
    }
  },

  mounted() {
    const cardList = []
    this.timer = setInterval(() => {
      const el = this.$el
      if (cardList.length > 10) {
        el.removeChild(cardList.splice(0, 1)[0])
      }

      const card = document.createElement('IDV')
      const date = new Date()
      this.yearMonthDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
      card.innerHTML = this.yearMonthDate + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
      card.classList.add('time-container')
      el.appendChild(card)
      cardList.push(card)

      setTimeout(() => {
        const card = cardList[cardList.length - 1]
        card.style.top = '80px'
        card.style.opacity = 1
      }, 100)
    }, 1000)
  },

  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>

<style lang="scss">
.new-year {
  height: 100%;
  position: relative;

  .time-container {
    position: absolute;
    left: 10%;
    right: 10%;
    top: 350px;
    width: 80%;
    height: 100px;
    line-height: 100px;
    font-size: 22px;
    color: #148acf;
    text-align: center;
    background-color: rgb(60, 197, 156);
    opacity: 0.2;
    transition-duration: 1300ms;
    transition-property: top, opacity;
  }
}
</style>
