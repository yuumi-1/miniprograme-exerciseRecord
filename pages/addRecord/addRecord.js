Page({
  data: {
    date: '',
    units: ['kg', 'lb'],
    unitIndex: 0,
    exercises: [
      { name: 'Squat', sets: [{ weight: '', reps: '', showAddBtn: true }] },
      { name: 'Deadlift', sets: [{ weight: '', reps: '', showAddBtn: true }] },
      { name: 'Benchpress', sets: [{ weight: '', reps: '', showAddBtn: true }] }
    ],
    keyboardHeight: 0,
    exerciseOptions: {
      value: "",
      options: [
        // 上肢推类
        { label: "标准俯卧撑", value: "pushup" },
        { label: "哑铃卧推", value: "dumbbellBench" },
        { label: "上斜哑铃卧推", value: "inclineDumbbellPress" },
        { label: "下斜杠铃卧推", value: "declineBarbellBench" },
        { label: "双杠臂屈伸", value: "dip" },
        { label: "过头推举", value: "overheadPress" },
        
        // 上肢拉类
        { label: "引体向上", value: "pullup" },
        { label: "高位下拉", value: "latPulldown" },
        { label: "哑铃划船", value: "dumbbellRow" },
        { label: "杠铃划船", value: "barbellRow" },
        { label: "单臂哑铃划船", value: "singleArmDumbbellRow" },
        { label: "俯身哑铃飞鸟", value: "bentOverDumbbellFly" },
        
        // 下肢训练
        { label: "深蹲", value: "squat" },
        { label: "罗马尼亚硬拉", value: "romanianDeadlift" },
        { label: "腿弯举", value: "legCurl" },
        { label: "腿伸展", value: "legExtension" },
        { label: "箭步蹲", value: "lunge" },
        { label: "保加利亚分腿蹲", value: "bulgarianSplitSquat" },
        
        // 核心训练
        { label: "平板支撑", value: "plank" },
        { label: "仰卧抬腿", value: "legRaise" },
        { label: "俄罗斯转体", value: "russianTwist" },
        { label: "侧平板支撑", value: "sidePlank" },
        { label: "卷腹", value: "crunch" },
        { label: "仰卧起坐", value: "situp" },
        
        // 肩部训练
        { label: "哑铃侧平举", value: "lateralRaise" },
        { label: "哑铃前平举", value: "frontRaise" },
        { label: "哑铃后束飞鸟", value: "rearDeltFly" },
        { label: "阿诺德推举", value: "arnoldPress" },
        
        // 手臂训练
        { label: "杠铃弯举", value: "barbellCurl" },
        { label: "哑铃集中弯举", value: "concentrationCurl" },
        { label: "绳索下压", value: "tricepPushdown" },
        { label: "颈后臂屈伸", value: "tricepExtension" },
        
        // 功能性训练
        { label: "波比跳", value: "burpee" },
        { label: "壶铃摇摆", value: "kettlebellSwing" },
        { label: "药球砸墙", value: "medicineBallSlam" },
        { label: "战绳", value: "battleRope" },
        
      ]
    }
  },
  
  onLoad() {
    // 初始化日期为今天
    const date = new Date();
    this.setData({
      date: `${date.getFullYear()}-${this.formatNumber(date.getMonth() + 1)}-${this.formatNumber(date.getDate())}`
    });
    //键盘监听
    this.keyboardListener = wx.onKeyboardHeightChange(res => {
      this.setData({
        keyboardHeight: res.height
      });
    });
  },
  // 页面卸载时取消监听
  onUnload() {
    this.keyboardListener && this.keyboardListener();
  },
  // 显示训练项选择器
  showExercisePicker(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      showExercisePicker: true,
      currentExerciseIndex: index
    });
  },

  // 隐藏训练项选择器
  hideExercisePicker() {
    this.setData({ showExercisePicker: false });
  },

  // 选择训练项
  selectExercise(e) {
    const optionIndex = e.currentTarget.dataset.index;
    const { presetExercises, currentExerciseIndex, exercises } = this.data;
    
    if (currentExerciseIndex >= 0 && optionIndex >= 0) {
      // 更新训练项名称
      exercises[currentExerciseIndex].name = presetExercises[optionIndex];
      
      this.setData({
        exercises,
        showExercisePicker: false
      });
      
      wx.showToast({ title: '已更新训练项', icon: 'success' });
    }
  },
  // 格式化数字为两位数
  formatNumber(n) {
    return n < 10 ? '0' + n : n;
  },

  // 日期选择变更
  bindDateChange(e) {
    this.setData({ date: e.detail.value });
  },

  // 单位选择变更
  bindUnitChange(e) {
    this.setData({ unitIndex: e.detail.value });
  },

  // 重量变更
  onWeightChange(e) {
    const { type, index } = e.currentTarget.dataset;
    const exercises = [...this.data.exercises];
    const exerciseIndex = exercises.findIndex(item => item.name === type);
    
    exercises[exerciseIndex].sets[index].weight = e.detail.value;
    this.updateShowAddBtn(exercises, exerciseIndex);
    this.setData({ exercises });
  
  },

  // 次数变更
  onRepsChange(e) {
    const { type, index } = e.currentTarget.dataset;
    const exercises = [...this.data.exercises];
    const exerciseIndex = exercises.findIndex(item => item.name === type);
    
    exercises[exerciseIndex].sets[index].reps = e.detail.value;
    this.updateShowAddBtn(exercises, exerciseIndex);
    this.setData({ exercises });
  
  },

  // 更新显示添加按钮的逻辑
  updateShowAddBtn(exercises, exerciseIndex) {
    const sets = exercises[exerciseIndex].sets;
    console.log(sets)
    sets.forEach((set, i) => {
      set.showAddBtn = (i === sets.length - 1);
    });
  },

  // 添加组
  addSet(e) {
    const type = e.currentTarget.dataset.type;
    const exercises = [...this.data.exercises];
    const exerciseIndex = exercises.findIndex(item => item.name === type);
    const sets = exercises[exerciseIndex].sets;
    exercises[exerciseIndex].sets.push({ weight: sets[sets.length-1].weight, reps: sets[sets.length-1].reps, showAddBtn: true });
    
    // 更新其他组的showAddBtn状态
    this.updateShowAddBtn(exercises, exerciseIndex);
    this.setData({ exercises });
  },

  // 删除组
  deleteSet(e) {
    const { type, index } = e.currentTarget.dataset;
    const exercises = [...this.data.exercises];
    const exerciseIndex = exercises.findIndex(item => item.name === type);
    
    if (exerciseIndex !== -1 && exercises[exerciseIndex].sets.length > 1) {
      exercises[exerciseIndex].sets.splice(index, 1);
      // 更新其他组的showAddBtn状态
      this.updateShowAddBtn(exercises, exerciseIndex);
      this.setData({ exercises });
    }
  },
  deleteItem(e) {
    // 获取训练项索引
    const { index } = e.currentTarget.dataset;
    const exercises = [...this.data.exercises];
    
    // 删除训练项
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${exercises[index].name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从数组中移除该项
          exercises.splice(index, 1);
          this.setData({ exercises });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },
  // 处理训练项选择
  onExerciseSelect(e) {
    const { index } = e.currentTarget.dataset;
    const value = e.detail.value;
    const selectedOption = this.data.exerciseOptions.options.find(
      option => option.value === value
    );
    const exercises = [...this.data.exercises];
    exercises[index].name = selectedOption.label;
    
    this.setData({ exercises });
  },

  // 自定义训练项名称输入
  onCustomNameChange(e) {
    const { index } = e.currentTarget.dataset;
    const { value } = e.detail;
    console.log(e.currentTarget);
    
    const exercises = [...this.data.exercises];
    exercises[index].name = value;
    
    this.setData({ exercises });
    
  },

  addCustomSet() {
    const exercises = [...this.data.exercises];
    
    // 查找最后一个自定义训练项的索引
    let lastCustomIndex = -1;
    exercises.forEach((item, index) => {
      if (item.isCustom) lastCustomIndex = index;
    });
    
    // 生成唯一的默认名称
    const defaultName = lastCustomIndex === -1 
      ? '输入自定义训练' 
      : `输入自定义训练${exercises.filter(item => item.isCustom).length + 1}`;
    
    // 添加新的自定义训练项
    exercises.push({
      name: defaultName,
      sets: [{ weight: '', reps: '', showAddBtn: true }],
      isCustom: true
    });
    
    // 更新数据
    this.setData({ exercises });
  },

  saveAndBack() {
    // 数据验证
    if (!this.validateData()) {
      return;
    }
  
    // 准备数据
    const workoutData = {
      date: this.data.date,
      unit: this.data.units[this.data.unitIndex],
      exercises: this.data.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets.filter(set => set.weight && set.reps)
      })),
      createTime: new Date()
    };
  
    // 保存到数据库
    wx.showLoading({ title: '保存中...' });
  
    // 先查询是否已有相同日期的记录
    wx.cloud.database().collection('workout_records')
      .where({
        date: this.data.date
      })
      .get()
      .then(res => {
        wx.hideLoading();
        
        if (res.data.length > 0) {
          // 存在相同日期的记录，执行合并
          const existingRecord = res.data[0];
          const mergedData = this.mergeWorkoutRecords(existingRecord, workoutData);
          // 更新记录
          wx.showLoading({ title: '更新记录...' });
          return wx.cloud.database().collection('workout_records')
            .doc(existingRecord._id)
            .update({
              data: {
                unit: mergedData.unit,
                exercises: mergedData.exercises,
                updateTime: new Date()
              }
            });
        } else {
          // 不存在相同日期的记录，直接添加
          return wx.cloud.database().collection('workout_records').add({
            data: workoutData
          });
        }
      })
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '保存成功', icon: 'success' });
        
        // 获取上一页实例并刷新数据
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage.refreshData && prevPage.refreshData();
  
        // 返回上一页
        setTimeout(() => wx.navigateBack(), 500);
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({ title: '保存失败', icon: 'none' });
        console.error('保存失败:', err);
      });
  },
  
  // 合并训练记录
  mergeWorkoutRecords(existingRecord, newRecord) {
    // 合并后的记录结构
    const mergedRecord = {
      ...existingRecord,
      updateTime: new Date()  // 添加更新时间
    };
    
    // 如果单位不同，使用新记录的单位
    if (existingRecord.unit !== newRecord.unit) {
      mergedRecord.unit = newRecord.unit;
    }
    
    // 合并训练项目
    const mergedExercises = [];
    
    // 处理已有项目
    existingRecord.exercises.forEach(existingExercise => {
      // 查找新项目中是否有同名项目
      const newExercise = newRecord.exercises.find(
        item => item.name === existingExercise.name
      );
      
      if (newExercise) {
        // 同名项目，合并训练组
        mergedExercises.push({
          name: existingExercise.name,
          sets: [...existingExercise.sets, ...newExercise.sets]
        });
      } else {
        // 新项目中没有的，保留原有项目
        mergedExercises.push(existingExercise);
      }
    });
    
    // 添加新项目中独有的项目
    newRecord.exercises.forEach(newExercise => {
      const exists = existingRecord.exercises.some(
        item => item.name === newExercise.name
      );
      
      if (!exists) {
        mergedExercises.push(newExercise);
      }
    });
    
    // 更新合并后的训练项目
    mergedRecord.exercises = mergedExercises;
    
    return mergedRecord;
  },

  // 数据验证
  validateData() {
    const hasData = this.data.exercises.some(exercise => 
      exercise.sets.some(set => set.weight && set.reps)
    );
    
    if (!hasData) {
      wx.showToast({ title: '请至少填写一组锻炼数据', icon: 'none' });
      return false;
    };
    
    return true;
  }

})