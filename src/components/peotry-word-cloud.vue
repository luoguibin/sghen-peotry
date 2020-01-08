<template>
  <div class="peotry-word-cloud">
    <div class="pwc-container pwc-set-container" v-if="yearPeotryCount">
      <div>
        <h3 style="padding: 10px 0;">{{ yearNum }}年年度诗词概况</h3>
        <p style="text-indent: 2em;">
          本年度共创建{{ yearPeotryCount }}首诗词，其中以选集
          <span class="pwc-span" @click="onClickPeotSet(yearPeotrySets[0])">【{{ yearPeotrySets[0].name }}】</span>
          {{ yearPeotrySets[0].count }}首稳居榜首
          <template v-if="yearPoets.length">
            ；诗词创建数量最多的是
            <span class="pwc-span" @click="onClickPeot(yearPoets[0])">[{{ yearPoets[0].name }}]</span>
            ，共创建{{ yearPoets[0].count }}首。
          </template>
        </p>
      </div>
      <h4 style="padding: 20px 0 10px;">选集TOP5</h4>
      <span v-for="item in yearPeotrySets" :key="item.id" class="pwc-set-item sg-label"
        @click="onClickPeotSet(item)">
        {{ item.name }}
        <span>({{ item.count }}首)</span>
      </span>
    </div>

    <div class="pwc-container" v-if="!isWordsErr">
      <h3 style="padding: 10px 0;">诗词云库</h3>
      <div ref="container" class="pwc-main"></div>
    </div>

    <div class="pwc-container pwc-set-container">
      <h3 style="padding: 10px 0;">选集总排行榜</h3>
      <span v-for="item in peotrySets" :key="item.id" class="pwc-set-item sg-label"
        @click="onClickPeotSet(item)">
        {{ item.name }}
        <span>({{ item.count }}首)</span>
      </span>
    </div>

  </div>
</template>

<script>
import { getHotWords, getPopularPoetrySets, getYearPoetrySets, getYearPoets } from '@/api'
import echarts from 'echarts'
import 'echarts-wordcloud'

export default {
  name: 'PeotryWordCloud',

  data () {
    return {
      words: [],
      isWordsErr: false,
      imgSrc: require('@/assets/img/icon.png'),
      maskImage: null,

      peotrySets: [],
      yearNum: new Date().getFullYear(),
      yearPeotrySets: [],
      yearPeotryCount: 0,
      yearPoets: []
    }
  },

  mounted () {
    window.pwc = this
    this.initChart()
    const image = new Image()
    image.src = this.imgSrc
    image.onload = e => {
      this.getHotWords()
    }
    this.maskImage = image
    // this.getHotWords()
    this.getPopularPoetrySets()
    this.getYearPoetrySets()
    this.getYearPoets()
  },

  methods: {
    initChart () {
      this.chart = echarts.init(this.$refs.container)
      this.chart.setOption({
        tooltip: {
          show: true,
          formatter: o => {
            return o.data.name + '&nbsp;&nbsp;&nbsp;共<span style="padding: 0 3px;">' + o.data.value + '</span>篇'
          }
        },
        series: [
          {
            type: 'wordCloud',

            // The shape of the "cloud" to draw. Can be any polar equation represented as a
            // callback function, or a keyword present. Available presents are circle (default),
            // cardioid (apple or heart shape curve, the most known polar equation), diamond (
            // alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.

            shape: 'star',

            // A silhouette image which the white area will be excluded from drawing texts.
            // The shape option will continue to apply as the shape of the cloud to grow.

            // maskImage: this.maskImage,

            // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
            // Default to be put in the center and has 75% x 80% size.

            left: 'center',
            top: 'center',
            width: '95%',
            height: '95%',
            right: null,
            bottom: null,

            // Text size range which the value in data will be mapped to.
            // Default to have minimum 12px and maximum 60px size.

            sizeRange: [18, 60],

            // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45

            rotationRange: [-45, 45],
            rotationStep: 45,

            // size of the grid in pixels for marking the availability of the canvas
            // the larger the grid size, the bigger the gap between words.

            gridSize: 8,

            // set to true to allow word being draw partly outside of the canvas.
            // Allow word bigger than the size of the canvas to be drawn
            drawOutOfBound: false,

            // Global text style
            textStyle: {
              normal: {
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                // Color can be a callback function or a color string
                color: function () {
                  // Random color
                  return (
                    'rgb(' +
                    [
                      Math.round(Math.random() * 160),
                      Math.round(Math.random() * 160),
                      Math.round(Math.random() * 160)
                    ].join(',') +
                    ')'
                  )
                }
              },
              emphasis: {
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },

            // Data is an array. Each array item must have name and value property.
            data: []
          }
        ]
      })
      this.chart.on('click', params => {
        this.onPeotryPage({ content: params.data.name })
      })
    },
    getHotWords () {
      this.isWordsErr = false
      getHotWords().then(res => {
        this.words = res.data
          .filter(o => o[1] > 1)
          .map(o => {
            return {
              name: o[0],
              value: o[1]
            }
          })
        this.setChartData()
      }).catch(() => {
        this.isWordsErr = true
      })
    },

    setChartData () {
      this.chart.setOption({
        series: [{ data: this.words }]
      })
      this.chart.resize()
    },

    getPopularPoetrySets () {
      getPopularPoetrySets().then(({ data }) => {
        this.peotrySets = data.data
      })
    },
    getYearPoetrySets () {
      const year = this.yearNum
      getYearPoetrySets({
        date0: (year - 1) + '-01-01 00:00:00',
        date1: year + '-01-01 00:00:00'
      }).then(({ data }) => {
        const list = data.data || []
        let count = 0
        list.forEach(o => {
          count += +o.count
        })
        this.yearPeotryCount = count
        this.yearPeotrySets = list.splice(0, 5)
      })
    },
    getYearPoets () {
      const year = this.yearNum
      getYearPoets({
        suffixPath: 'peotry-user/list-year',
        date0: (year - 1) + '-01-01 00:00:00',
        date1: year + '-01-01 00:00:00'
      }).then(({ data }) => {
        this.yearPoets = data.data || []
      })
    },

    onClickPeot ({ id }) {
      this.onPeotryPage({ userId: id })
    },
    onClickPeotSet ({ id }) {
      this.onPeotryPage({ setId: id })
    },
    onPeotryPage (query) {
      this.$router.push({ name: 'peotry-list', query })
    }
  }
}
</script>

<style lang="scss" scoped>
.peotry-word-cloud {
  max-width: 400px;

  .pwc-main {
    width: 348px;
    height: 348px;
    margin: 0 auto;
    @media screen and (max-width: 400px) {
      width: 300px;
      height: 300px;
    }
  }

  .pwc-container {
    width: 100%;
    padding: 0 25px;
    margin-bottom: 16px;
    background-color: white;
    border: 1px solid #eeeeee;
    box-sizing: border-box;
    vertical-align: top;
    text-align: initial;
  }

  .pwc-set-container {
    height: auto;
    .pwc-set-item {
      display: inline-block;
      margin: 0 15px 15px 0;
      span {
        font-size: 14px;
      }
    }
  }

  .pwc-span {
    color: #148acf;
    white-space: pre;
    cursor: pointer;
    &:active {
      color: rgba(20, 139, 207, 0.75);
    }
  }
}
</style>
