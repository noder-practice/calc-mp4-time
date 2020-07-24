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

const resolveVideoPath = filename => path.resolve(__dirname, `./video/${filename}`)

const readFileBuffer = async (filePath) => {
  const fd = await open(filePath, 'r')

  // http://nodejs.cn/api/fs.html#fs_fs_read_fd_buffer_offset_length_position_callback
  const { buffer } = await read(fd, Buffer.alloc(100), 0, 100, 0)

  return buffer
}

const flow = (fns) => (filename) => fns.reduce(async (res, next) => {
  try {
    // 因为这里的 cb 为 async fn 所以每次返回的结果除了第一次的初始值 都是Promise 需要等待一下
    return next(await res)
  } catch (error) {
    console.log(error);
  }
}, filename)



const getVideoTimeFn = flow([
  resolveVideoPath,
  readFileBuffer,
  getTime,
  getLocaleTime
])

const formatTime = ({ file, time }) => ({
  "file": file,
  "视频时长": time
})

const readAllVideoTime = async () => {
  const videoFilenameList = fs.readdirSync(path.resolve(__dirname, './video')).filter(filename => filename.endsWith('.mp4')) // TODO 扩展性格
  
  const videoTimes = await Promise.all(videoFilenameList.map(filename => getVideoTimeFn(filename)))

  return videoFilenameList.map((_, i) => formatTime({
    file: videoFilenameList[i],
    time: videoTimes[i],
  }))
}

;(async () => {
  const allVideoTimes = await readAllVideoTime()

  console.log(allVideoTimes);
})()
