//index.js
//获取应用实例
const app = getApp()
const { formatTime } = require('../../utils/util');
const { request } = require('../../utils/request');

Page({
  data: {
    nowTime:'',
    city:{},
    nowWeather: {},
    indicesData: [],
    weatherData: {},
    airData:{},
    currentId: 0,
    indicesIcon: {
      type1: '/pages/img/sport.png',
      type2: '/pages/img/car_washing.png',
      type3: '/pages/img/dressing.png',
      type5: '/pages/img/uv.png',
      type9: '/pages/img/flu.png',
    },
  },
  onLoad: function () {
    this.setData({
      nowTime: formatTime(new Date())
    })
    if (app.globalData.address) {
      this.getGeoCity(app.globalData.address);
    } else {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      
      app.userInfoReadyCallback = res => {
        app.globalData.address = res;
        this.getGeoCity(res);
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
  // 获取城市信息
  getGeoCity: function (navData){
    const that = this;
    wx.showLoading({
      title: '加载中',
    })
    request({
      url: '/geo/v2/city/lookup?',
      data: {
        location: navData.longitude + ',' + navData.latitude,
      },
    }).then(res => {
      if (res.code === '200') {
        that.setData({
          city: res.location[0],
        })
        that.getWeatherData(navData);
        that.weatherFun();
      } 
    })
  },
  // 获取实时天气
  getWeatherData: function (navData){
    const that = this;
    request({
      url: '/v7/weather/now?',
      data: {
        location: navData.longitude + ',' + navData.latitude,
      },
    }).then(res => {
      if (res.code === '200') {
        that.setData({
          nowWeather: res.now,
        })
      } 
    })
  },
  // 切换城市
  bindChooseAdd:function(){
    var that = this;
    wx.chooseLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success(res) {
        that.getGeoCity(res);
      }
    })
  },
  // 获取定位图标
  bindNav:function(){
    var that = this;
    wx.getLocation({
      altitude: true,
      success: res => {
        that.getGeoCity(res);
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
                        that.getGeoCity(res);
                      }
                    })
                  }else{ //未同意-直接返回
                    that.getGeoCity(app.globalData.defaultNav);
                  }
                }
              })
            }else{//点击取消
              that.getGeoCity(app.globalData.defaultNav);
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
  //天气集合
  weatherFun(){
    var that = this;
    const { city } = that.data;
    // 天气指数
    request({
      url: '/v7/indices/1d?',
      data: {
        type:  '1,2,3,5,9',
        location: city.lon + ',' + city.lat,
      },
    }).then(res => {
      if (res.code === '200') {
        that.setData({
          indicesData: res.daily,
        })
        wx.hideLoading();
      } 
    })

    //空气质量
    request({
      url: `/airquality/v1/current/${city.lat}/${city.lon}`,
    }).then(res => {
      if (res) {
        const obj = {}
        const aqiItem = res?.indexes.find(item => item.code === 'cn-mee');
        if (aqiItem) {
          obj.quality = aqiItem;
          const pm25 = res?.pollutants.find(item =>  item.code === 'pm2p5');
          obj.pm25 = pm25.concentration.value;
        }
        that.setData({
          airData: obj,
        })
      }
    })

    // 七日天气预报
    request({
      url: '/v7/weather/7d?',
      data: {
        location: city.lon + ',' + city.lat,
      },
    }).then(res => {
      if (res.code === '200') {
        that.setData({
          weatherData: { 
            ...res,
            updateTime: new Date(res.updateTime).toLocaleString(),
          },
        })
      } 
    })
  },
  onShareAppMessage() {
    return {
      title: '小彩天气',
      page: 'pages/index/index',
    }
  },
  onShareTimeline() {
    return {
      title: '小彩天气'
    }
  }
})
