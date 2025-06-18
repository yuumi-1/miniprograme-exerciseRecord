// index.js
import wxCharts from '../../components/wx-charts/dist/wxcharts-min.js'; // 根据实际路径调整

Page({
  data: {
    chartWidth: 300,
    chartHeight: 200,
    weightData: [],
  },

  onReady() {
    this.getWeightData();
    const date = new Date();
    this.setData({
      date: `${date.getFullYear()}-${this.formatNumber(date.getMonth() + 1)}-${this.formatNumber(date.getDate())}`,
    });
  },
  formatNumber(n) {
    return n < 10 ? '0' + n : n;
  },
  getWeightData() {
    wx.showLoading({
      title: '加载中',
    })
    
    wx.cloud.callFunction({
      name: 'getLastWeightRecord',
      success: res => {
        wx.hideLoading()
        this.setData({
          weightData: res.result.data,
        })
        if (res.result.success) {
          const weightData = res.result.data;
          this.renderChart(weightData);
        } else {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          })
          console.error('云函数调用失败', res.result.error);
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        console.error('云函数调用失败', err);
      }
    })
  },
  renderChart(data) {
    const dateList = data.map(item => item.date).reverse();
    const weightValues = data.map(item => item.weight).reverse();
    
    const monthDayList = dateList.map(date => {
      const [, month, day] = date.split('-');
      return `${month}-${day}`;
    });
    if (data.length===0){
      return
    }
    try {
      const res = wx.getWindowInfo();
      this.setData({
        chartWidth: res.windowWidth - 40
      });
    } catch (e) {
      console.error('获取系统信息失败', e);
    }

    new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: monthDayList,
      animation: false,
      legend : false,     
      series: [{
        data: weightValues,
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        grid: false,
        min: Math.min(...weightValues) - 5, // 动态计算Y轴最小值
        max: Math.max(...weightValues) + 5, // 动态计算Y轴最大值
        format: function (val) {
          return val.toFixed(0);
        },
      },
      width: this.data.chartWidth,
      height: this.data.chartHeight,
      dataLabel: true,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },
  handlePopup(e) {
    this.setData({ visible: true });
  },
  onVisibleChange(e) {
    this.setData({
      visible: e.detail.visible,
    });
  },
  onClose() {
    this.setData({
      visible: false,
    });
  },
  onWeightChange(e) {
    const weight = e.detail.value;
    this.setData({ weightValue:weight });  
  },
  saveWeight() {
    wx.cloud.callFunction({
      name: 'addWeightRecord',
      data: {
        weight: this.data.weightValue,
        date: this.data.date
      },
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          wx.redirectTo({
            url: '/pages/weightRecord/index'
          });
        } else {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          })
          console.error('云函数调用失败', res.result.error);
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        console.error('云函数调用失败', err);
      }
    })
    
    // 关闭弹窗
    this.onClose();
  },
  bindDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  deleteRecord(e) {
    const recordId = e.currentTarget.dataset.id; 

    // 显示确认对话框
    wx.showModal({
      title: "确认删除",
      content: "确定要删除这条训练记录吗？",
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          wx.cloud.callFunction({
            name: 'delWeightRecord',
            data: {
              id: recordId
            },
            success: res => {
              wx.showToast({
                title: '删除成功',
                icon: 'none'
              })
              wx.redirectTo({
                url: '/pages/weightRecord/index'
              });
            },
            fail: err => {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          })
        }
      }
    });
  },
});