const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const week = date.getDay()

  return [year, month, day].map(formatNumber).join('-') + ' ❤️ ' + '周' + ['日', '一', '二', '三', '四', '五', '六'][week]
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
module.exports = {
  formatTime: formatTime
}
