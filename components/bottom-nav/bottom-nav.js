// components/bottom-nav/bottom-nav.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转到数据分析页面
    navigateToCalendar: function() {
      wx.navigateTo({
        url: '/pages/calendar/calendar'
      });
    },
    // 跳转到添加记录页面
    navigateToAddRecord: function() {
      wx.navigateTo({
        url: '/pages/addRecord/addRecord'
      });
    },
    // 跳转到我的页面
    navigateToProfile: function() {
      wx.navigateTo({
        url: '/pages/Profile/Profile'
      });
    }
  }
})