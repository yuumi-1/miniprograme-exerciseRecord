// app.js
App({
  onLaunch(){
    const settings = wx.getStorageSync('workoutSettings');
    if (settings) {
      this.globalData.userSettings = settings;
    }
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
    needRefreshCalendar: false,
    userSettings: {
      // 用户选择的默认训练项
      defaultExercises: ['深蹲', '硬拉', '卧推']
    },
  },
  saveUserSettings() {
    wx.setStorageSync('workoutSettings', this.globalData.userSettings);
  },
  calcNavBarInfo () {
    // 获取系统信息
    const systemInfo = wx.getWindowInfo();
    // 胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.globalData.navBarHeight = systemInfo.statusBarHeight + 44;
    this.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
    this.globalData.menuTop=  menuButtonInfo.top;
    this.globalData.menuHeight = menuButtonInfo.height;
  }
})
