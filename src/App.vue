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
      <canvas ref="canvas"></canvas>

      <em-button @click="configure" type="text">设置</em-button>
      <span>|</span>
      <em-button @click="download" type="text">下载</em-button>

      <a
        class="hidden"
        ref="anchor">
        download
      </a>
    </section>
  </div>
</template>

<style lang="scss">
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 40px;

    canvas {
      width: 80%;
      display: block;
      margin: 20px auto;
    }

    .img-inputer.picked {
      height: auto;
    }

    .img-inputer__preview-box {
      background-color: transparent;
      font-size: 0;
      position: relative;
    }

    .hidden {
      display: none;
    }
  }
</style>

<script>
import { hex2rgb, downloadFile } from './utils'
import colors from './colors'
export default {
  name: 'app',

  data () {
    return {
      file: null,
      imageData: null,
      ctx: null,
      points: [],
      config: {
        gray: true,
        contrast: 1
      }
    }
  },

  methods: {
    onFilePick (file, fileName) {
      this.fileName = fileName
      this.config = {
        gray: true,
        contrast: 1
      }
      setTimeout(this.draw, 200)
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

    contrast () {
      const data = this.imageData.data
      const ratio = 100
      const factor = (259 * (ratio + 255)) / (255 * (259 - ratio))
      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128
        data[i + 1] = factor * (data[i + 1] - 128) + 128
        data[i + 2] = factor * (data[i + 2] - 128) + 128
      }
      this.ctx.putImageData(this.imageData, 0, 0)
    },

    calculate () {
      const data = this.imageData.data
      const canvas = this.$refs.canvas
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
          new ImageData(new Uint8ClampedArray(newData), canvas.width / 2, canvas.height / 2),
          this.points[block].x,
          this.points[block].y
        )
      }
    },

    download () {
      const a = this.$refs.anchor
      downloadFile(a, this.fileName, this.$refs.canvas.toDataURL('image/png'))
    },

    draw () {
      const img = document.getElementsByTagName('img')[0]
      const canvas = this.$refs.canvas
      const ratio = img.width / 200
      canvas.height = 2 * img.height / ratio
      canvas.width = 2 * img.width / ratio
      this.ctx = canvas.getContext('2d')
      this.ctx.drawImage(img, 0, 0, img.width / ratio, img.height / ratio)
      this.points = [{
        x: 0,
        y: 0
      }, {
        x: canvas.width / 2,
        y: 0
      }, {
        x: 0,
        y: canvas.height / 2
      }, {
        x: canvas.width / 2,
        y: canvas.height / 2
      }]
      this.imageData = this.ctx.getImageData(0, 0, canvas.width / 2, canvas.height / 2)
      this.process()
    },

    process () {
      const { gray, contrast } = this.config
      if (gray) {
        this.grayscale()
      }
      for (let i = 0; i < contrast; i++) {
        this.contrast()
      }
      this.calculate()
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
              <em-list-item title={`图片对比度：${this.config.contrast}`}>
                <em-range
                  min={0}
                  max={5}
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
              this.draw()
              close()
            }
          }
        ]
      })
    }
  }
}
</script>
