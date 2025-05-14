// app.js
App({
  onLaunch: function(){
    wx.cloud.init({
      env:'cloud1-1g8heoms9adc09e6'
    })
    this.calcNavBarInfo()
  },
  globalData: {
    //全局数据管理
    navBarHeight: 0, 
    menuRight: 0, 
    menuTop: 0, 
    menuHeight: 0,
    eventBus: {
      listeners: {},
      on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
      },
      emit(event, data) {
        if (this.listeners[event]) {
          this.listeners[event].forEach(callback => callback(data));
        }
      }
    }
  },
  calcNavBarInfo () {
    // 获取系统信息
    const systemInfo = wx.getWindowInfo();
    console.log(systemInfo);
    // 胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    console.log(menuButtonInfo);
    this.globalData.navBarHeight = systemInfo.statusBarHeight + 44;
    this.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
    this.globalData.menuTop=  menuButtonInfo.top;
    this.globalData.menuHeight = menuButtonInfo.height;
  }
})
