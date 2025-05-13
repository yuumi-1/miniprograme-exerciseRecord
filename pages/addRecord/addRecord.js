Page({
  data: {
    date: '',
    units: ['kg', 'lb'],
    unitIndex: 0,
    squatSets: [{ weight: '', reps: '' }],
    deadliftSets: [{ weight: '', reps: '' }],
    benchpressSets: [{ weight: '', reps: '' }]
  },

  onLoad: function() {
    // 初始化日期为今天
    const date = new Date();
    const year = date.getFullYear();
    const month = this.formatNumber(date.getMonth() + 1);
    const day = this.formatNumber(date.getDate());
    this.setData({
      date: `${year}-${month}-${day}`
    });
  },
  
  // 格式化数字为两位数
  formatNumber: function(n) {
    return n < 10 ? '0' + n : n;
  },

  // 日期选择变更
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    });
  },

  // 单位选择变更
  bindUnitChange: function(e) {
    this.setData({
      unitIndex: e.detail.value
    });
  },

  // 深蹲重量变更
  bindSquatWeightChange: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const sets = this.data.squatSets;
    sets[index].weight = value;
    this.setData({ squatSets: sets });
  },

  // 深蹲次数变更
  bindSquatRepsChange: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const sets = this.data.squatSets;
    sets[index].reps = value;
    this.setData({ squatSets: sets });
  },

  // 硬拉重量变更
  bindDeadliftWeightChange: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const sets = this.data.deadliftSets;
    sets[index].weight = value;
    this.setData({ deadliftSets: sets });
  },

  // 硬拉次数变更
  bindDeadliftRepsChange: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const sets = this.data.deadliftSets;
    sets[index].reps = value;
    this.setData({ deadliftSets: sets });
  },

  // 卧推重量变更
  bindBenchpressWeightChange: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const sets = this.data.benchpressSets;
    sets[index].weight = value;
    this.setData({ benchpressSets: sets });
  },

  // 卧推次数变更
  bindBenchpressRepsChange: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const sets = this.data.benchpressSets;
    sets[index].reps = value;
    this.setData({ benchpressSets: sets });
  },

  // 添加组
  addSet: function(e) {
    const type = e.currentTarget.dataset.type;
    const newSet = { weight: '', reps: '' };
    
    if (type === 'squat') {
      this.setData({
        squatSets: [...this.data.squatSets, newSet]
      });
    } else if (type === 'deadlift') {
      this.setData({
        deadliftSets: [...this.data.deadliftSets, newSet]
      });
    } else if (type === 'benchpress') {
      this.setData({
        benchpressSets: [...this.data.benchpressSets, newSet]
      });
    }
  },

  // 删除组
  deleteSet: function(e) {
    const type = e.currentTarget.dataset.type;
    const index = e.currentTarget.dataset.index;
    
    if (type === 'squat') {
      const sets = this.data.squatSets;
      sets.splice(index, 1);
      this.setData({ squatSets: sets });
    } else if (type === 'deadlift') {
      const sets = this.data.deadliftSets;
      sets.splice(index, 1);
      this.setData({ deadliftSets: sets });
    } else if (type === 'benchpress') {
      const sets = this.data.benchpressSets;
      sets.splice(index, 1);
      this.setData({ benchpressSets: sets });
    }
  },

  // 保存并返回
  saveAndBack: function() {
    // 数据验证
    if (!this.validateData()) {
      return;
    }

    // 准备数据
    const workoutData = {
      date: this.data.date,
      unit: this.data.units[this.data.unitIndex],
      exercises: [
        {
          name: 'Squat',
          sets: this.data.squatSets.filter(set => set.weight || set.reps)
        },
        {
          name: 'Deadlift',
          sets: this.data.deadliftSets.filter(set => set.weight || set.reps)
        },
        {
          name: 'Benchpress',
          sets: this.data.benchpressSets.filter(set => set.weight || set.reps)
        }
      ],
      createTime: new Date()
    };

    // 保存到数据库
    wx.showLoading({
      title: '保存中...'
    });

    // 使用云开发数据库保存
    const db = wx.cloud.database();
    db.collection('workout_records').add({
      data: workoutData
    }).then(() => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
      console.error('保存失败:', err);
    });
  },

  // 数据验证
  validateData: function() {
    // 检查是否有填写的锻炼数据
    const hasSquatData = this.data.squatSets.some(set => set.weight || set.reps);
    const hasDeadliftData = this.data.deadliftSets.some(set => set.weight || set.reps);
    const hasBenchpressData = this.data.benchpressSets.some(set => set.weight || set.reps);
    
    if (!hasSquatData && !hasDeadliftData && !hasBenchpressData) {
      wx.showToast({
        title: '请至少填写一组锻炼数据',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  }
});    