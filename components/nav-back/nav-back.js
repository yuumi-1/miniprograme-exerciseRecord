// components/nav-back/nav-back.js
Component({
  properties: {
    // 图标类型（home、arrow-left等）
    icon: {
      type: String,
      value: 'back'
    },
    // 图标大小
    size: {
      type: String,
      value: '15'
    },
    // 返回类型：back（返回上一页）或home（返回首页）
    returnType: {
      type: String,
      value: 'back'
    }
  },
  data: {
    backStyle: ''
  },
  lifetimes: {
    attached() {
      // 获取全局导航栏数据
      const app = getApp();
      const { menuHeight, menuRight, menuTop } = app.globalData;
      
      // 动态生成样式
      const backStyle = `
        height: ${menuHeight}px;
        width: ${menuHeight}px;
        left: ${menuRight}px;
        top: ${menuTop}px;
        line-height: ${menuHeight}px;
      `;
      
      this.setData({ backStyle });
    }
  },
  methods: {
    // 返回事件处理
    onNavigateBack() {
      if (this.properties.returnType === 'home') {
        // 返回首页
        wx.switchTab({ url: '/pages/index/index' });
      } else {
        // 返回上一页
        wx.navigateBack();
      }
    }
  }
});