/** 天气api接口 */
const BASE_URL = 'https://example.api.com';

function request(options) {

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url, // 拼接完整的URL
      data: options.data || {}, // 请求数据
      method: options.method || 'GET', // 请求方法，默认为GET
      header: {
        'content-type': 'application/json', // 默认的Content-Type
        'X-QW-Api-Key': 'apikey', // 天气apikey
        ...options.header // 可以覆盖默认的header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data); // 成功回调
        } else {
          reject(res); // 状态码非200时拒绝
        }
      },
      fail: (error) => {
        reject(error); // 失败回调
      }
    });
  });
}

module.exports = {
  request,
};
