<template>
  <div class="peotry-word-cloud">
    <div class="pwc-container pwc-set-container">
      <h3 style="padding: 10px 0;">选集排行</h3>
      <span v-for="item in peotrySets" :key="item.id" class="pwc-set-item">
        {{ item.name }}
        <span>({{ item.count }}首)</span>
      </span>
    </div>
    <div class="pwc-container" v-if="!isWordsErr">
      <h3 style="padding: 10px 0;">诗词云库</h3>
      <div ref="container" style="height: 234px;"></div>
    </div>
  </div>
</template>

<script>
import { getHotWords, getDynamicData } from '@/api'
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

      peotrySets: []
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
        console.log(params.data)
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
    },

    getPopularPoetrySets () {
      getDynamicData({ suffixPath: 'peotry-set/popular' }).then(({ data }) => {
        this.peotrySets = data.data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.peotry-word-cloud {
  text-align: center;

  .pwc-container {
    display: inline-block;
    width: 100%;
    max-width: 360px;
    height: 280px;
    padding: 0 25px;
    box-sizing: border-box;
    vertical-align: top;
    text-align: initial;
  }

  .pwc-set-container {
    max-width: 400px;
    height: auto;
    .pwc-set-item {
      display: inline-block;
      padding: 5px 8px;
      margin: 0 15px 15px 0;
      font-size: 20px;
      color: white;
      border-radius: 8px;
      background-color: rgb(58, 135, 155);
      cursor: pointer;
      &:hover {
        background-color: rgba(58, 135, 155, 0.9);
      }
      &:active {
        background-color: rgba(58, 135, 155, 0.75);
      }
      span {
        font-size: 16px;
      }
    }
  }
}
</style>
