//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    nowTime:'',
    city:{},
    weatherData:{},
    airData:{},
    currentId: 0
  },
  onLoad: function () {
    this.setData({
      nowTime: util.formatTime(new Date())
    })
    if (app.globalData.address) {
      this.getWeatherData(app.globalData.address);
    } else {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      
      app.userInfoReadyCallback = res => {
        app.globalData.address = res;
        this.getWeatherData(res);
      }
    }
   
  },
  onPullDownRefresh:function(){//下拉
    const that = this;
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(function(){
      that.weatherFun();
    },300)
  },
  getWeatherData: function (navData){
    const that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://search.heweather.com/find?',
      data: {
        location: navData.longitude + ',' + navData.latitude,
        key: '和风天气key'
      },
      method: 'GET',
      success: function (res) {
        that.setData({
          city: res.data.HeWeather6[0].basic[0],
        })
        that.weatherFun();
      },
      fail: function (res) {
        console.log(res)
      }
    }) 
  },
  bindChooseAdd:function(){
    var that = this;
    wx.chooseLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success(res) {
        that.getWeatherData(res);
      }
    })
  },
  bindNav:function(){
    var that = this;
    wx.getLocation({
      altitude: true,
      success: res => {
        that.getWeatherData(res);
      },
      fail(res) {
        wx.showModal({
          title: '警告',
          content: '获取定位授权失败,将无法正常显示当地天气,点击确定重新获取授权。',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({ //打开用户授权设置
                success: (res) => {
                  if (res.authSetting["scope.userLocation"]) {//如果用户重新同意了授权定位
                    wx.getLocation({
                      altitude: true,
                      success: function (res) {
                        that.getWeatherData(res);
                      }
                    })
                  }else{ //未同意-直接返回
                    that.getWeatherData(app.globalData.defaultNav);
                  }
                }
              })
            }else{//点击取消
              that.getWeatherData(app.globalData.defaultNav);
            }
          }
        })
      },
    })
  },
  clickTab: function (e) {
    var that = this;
    if (this.data.currentId === e.currentTarget.dataset.current) {
      return false;
    } else {
      that.setData({
        currentId: e.currentTarget.dataset.current
      })
    }
  },
  swiperChange(e) {
    var that = this;
    that.setData({
      currentId: e.detail.current
    })
  },
  weatherFun(){
    var that = this;
    //天气集合
    wx.request({
      url: 'https://free-api.heweather.com/s6/weather',
      data: {
        location: that.data.city.location,
        key: '和风天气key'
      },
      method: 'GET',
      success: function (res) {
        that.setData({
          weatherData: res.data.HeWeather6[0],
        })
        wx.hideLoading();
        // wx.stopPullDownRefresh();
      },
      fail: function (res) {
        console.log(res)
      }
    })
    //空气质量
    wx.request({
      url: 'https://free-api.heweather.com/s6/air/now',
      data: {
        location: that.data.city.parent_city,
        key: '和风天气key'
      },
      method: 'GET',
      success: function (res) {
        that.setData({
          airData: res.data.HeWeather6[0].air_now_city,
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  }
})
