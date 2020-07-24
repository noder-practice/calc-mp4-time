
const { readAllVideoTime } = require('./utils')

;(async () => {
  const allVideoTimes = await readAllVideoTime()

  console.log(allVideoTimes);
})()
