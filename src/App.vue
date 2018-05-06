<template>
  <div id="app">
    <img-input
      v-model="file"
      :class="{ 'picked': file }"
      placeholder="点击选择图片"
      accept="image/*"
      icon="img"
      :on-change="onFilePick"
      :capture="false"
      theme="light"
      no-mask>
    </img-input>

    <section v-if="file">
      <canvas ref="canvas" class="hidden"></canvas>
      <img
        class="output"
        :src="imageSrc"
        alt="output"
        v-show="ready">

      <p v-show="showWeixinTip" class="weixin-tip">
        轻触图片，在图片放大后<br>长按图片并选择「保存图片」
      </p>

      <em-button @click="configure" type="text">设置</em-button>
      <span>|</span>
      <em-button @click="download" type="text">下载</em-button>

      <a class="hidden" ref="anchor">download</a>
    </section>
  </div>
</template>

<script>
import { hex2rgb, getObjectUrl, getBreakpoints } from './utils'
import colors from './colors'

const IMAGE_WIDTH = 200

export default {
  name: 'app',

  data () {
    return {
      ready: false,
      file: null,
      imageData: null,
      imageSrc: '',
      ctx: null,
      points: [],
      config: {
        gray: true,
        invert: false,
        contrast: 100
      },
      showWeixinTip: false
    }
  },

  methods: {
    onFilePick (file, fileName) {
      this.fileName = fileName
      this.showWeixinTip = false
      this.config = {
        gray: true,
        invert: false,
        contrast: 100
      }
      setTimeout(this.drawToImage, 200)
    },

    grayscale () {
      const data = this.imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = avg
        data[i + 1] = avg
        data[i + 2] = avg
      }
      this.ctx.putImageData(this.imageData, 0, 0)
    },

    invert () {
      const data = this.imageData.data
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]
        data[i + 1] = 255 - data[i + 1]
        data[i + 2] = 255 - data[i + 2]
      }
      this.ctx.putImageData(this.imageData, 0, 0)
    },

    contrast (deg) {
      const data = this.imageData.data
      const ratio = (deg / 100) + 1
      const factor = 128 * (1 - ratio)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * ratio + factor
        data[i + 1] = data[i + 1] * ratio + factor
        data[i + 2] = data[i + 2] * ratio + factor
      }
      this.ctx.putImageData(this.imageData, 0, 0)
    },

    applyPopArtColors () {
      const data = this.imageData.data
      const canvas = this.$refs.canvas
      this.points = getBreakpoints(canvas)
      for (let block = 0; block < 4; block++) {
        const newData = []
        for (let i = 0; i < data.length; i += 4) {
          let level
          if (data[i] < 86) {
            level = 'level1'
          } else if (data[i] < 171) {
            level = 'level2'
          } else {
            level = 'level3'
          }
          const { r, g, b } = hex2rgb(colors[block][level])
          newData.push(r, g, b, data[i + 3])
        }
        this.ctx.putImageData(
          new ImageData(new Uint8ClampedArray(newData), IMAGE_WIDTH, canvas.height / 2),
          this.points[block].x,
          this.points[block].y
        )
      }
      this.imageSrc = getObjectUrl(this.$refs.canvas.toDataURL('image/png'))
      this.ready = true
    },

    download () {
      const ua = navigator.userAgent.toLowerCase()
      if (/micromessenger/.test(ua)) {
        this.showWeixinTip = true
        return
      }
      const a = this.$refs.anchor
      a.download = this.fileName
      a.href = this.imageSrc
      a.click()
    },

    drawToImage () {
      const img = document.getElementsByTagName('img')[0]
      const canvas = this.$refs.canvas
      const imageHeight = Math.round(IMAGE_WIDTH * img.height / img.width)
      canvas.height = 2 * imageHeight
      canvas.width = 2 * IMAGE_WIDTH
      this.ctx = canvas.getContext('2d')
      this.ctx.drawImage(img, 0, 0, IMAGE_WIDTH, imageHeight)
      this.imageData = this.ctx.getImageData(0, 0, IMAGE_WIDTH, imageHeight)
      this.postProcess()
    },

    postProcess () {
      const { gray, invert, contrast } = this.config
      if (gray) {
        this.grayscale()
      }
      if (invert) {
        this.invert()
      }
      if (contrast !== 0) {
        this.contrast(contrast)
      }
      this.applyPopArtColors()
    },

    configure () {
      const onInput = (val, prop) => {
        this.config[prop] = val
      }
      const close = this.$actionsheet({
        closeOnClickModal: false,
        lockScroll: true,
        items: [
          () => (
            <em-list>
              <em-list-item title="对图片作灰度处理">
                <em-switch
                  value={this.config.gray}
                  on-input={ val => onInput(val, 'gray') }>
                </em-switch>
              </em-list-item>
              <em-list-item title="对图片作反色处理">
                <em-switch
                  value={this.config.invert}
                  on-input={ val => onInput(val, 'invert') }>
                </em-switch>
              </em-list-item>
              <em-list-item title={`图片对比度：${this.config.contrast}`}>
                <em-range
                  min={-50}
                  max={200}
                  value={this.config.contrast}
                  on-input={ val => onInput(val, 'contrast') }>
                </em-range>
              </em-list-item>
            </em-list>
          ),
          {
            text: '确定',
            type: 'primary',
            onClick: () => {
              this.drawToImage()
              close()
            }
          }
        ]
      })
    }
  }
}
</script>
