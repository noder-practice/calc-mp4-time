const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')

const { promisify } = require('util')
const open = promisify(fs.open)
const read = promisify(fs.read)


// add duration plugin to dayjs https://day.js.org/docs/zh-CN/plugin/duration
dayjs.extend(duration)

/**
 * 获取 mp4 的时间，参数是 mp4 的流
 * @param {*} buffer 
 */
function getTime(buffer) {
  // mp4 头文件规范
  const start = buffer.indexOf(Buffer.from('mvhd')) + 17
  const timeScale = buffer.readUInt32BE(start)
  const duration = buffer.readUInt32BE(start + 4)
  const movieLength = Math.floor(duration / timeScale)
  return movieLength
}


function getLocaleTime(seconds) {
  return dayjs.duration(seconds * 1000)
    .toJSON()
    .replace(/[PYDTHMS]/g, (str, i, rawStr) => {
      switch(str) {
        case 'Y': return '年'
        case 'M': {
          const match = rawStr.match(/M/ig) || []

          if (match.length >= 2) {
            return rawStr.indexOf(str) === i ? '月' : '分钟'
          } else {
            return '分钟'
          }

        }
        case 'D': return '天'
        case 'H': return '小时'
        case 'M': return '分钟'
        case 'S': return '秒'
        default: return ''
      }
    })
}

;(async () => {
  const filePath = path.resolve(__dirname, './video/v1.mp4')
  const fd = await open(filePath, 'r')
  
  // http://nodejs.cn/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback
  const { buffer } = await read(fd, Buffer.alloc(100), 0, 100, 0)

  const time = getTime(buffer)
  
  const res = {
    '视频时长': getLocaleTime(time)
  }

  console.log(res);
})()
