//app.js
App({
  onLaunch: function () {
    this.getNavFun();
  },
  onHide:function(){
    this.globalData.hideTime = new Date().getTime();
  },
  onShow: function (e) {
    const nowTime = new Date().getTime();
    if (nowTime - this.globalData.hideTime > 160000){ //超出时间重新获取数据
      this.getNavFun();
    }
  },
  getNavFun:function(){
    var that = this;
    wx.getLocation({
      altitude: true,
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        this.globalData.address = res;

        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (this.userInfoReadyCallback) {
          this.userInfoReadyCallback(res)
        }
      },
      fail(res) { //未获得定位授权
        if (that.userInfoReadyCallback) {
          that.userInfoReadyCallback(that.globalData.defaultNav)
        }
      },
    })
  },
  globalData: {
    address: null,
    defaultNav: {//默认定位
      longitude: 116.397827,
      latitude: 39.90374
    },
    hideTime:0
  }
})