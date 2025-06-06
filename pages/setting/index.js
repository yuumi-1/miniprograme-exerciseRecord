Component({
  data: {
    current: [],
    exerciseOptions: {
      value: "",
      options: [
        // 上肢推类
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
        { label: "罗马尼亚硬拉", value: "romanianDeadlift" },
        { label: "泽奇深蹲", value: "romanianDeadlift2" },
        { label: "前蹲", value: "legCurl" },
        { label: "器械倒蹬", value: "lunge" },
        { label: "坐姿腿弯举", value: "bulgarianSplitSquat" },
        
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
        { label: "颈后臂屈伸", value: "tricepExtension2" },
        
        // 功能性训练
        { label: "波比跳", value: "burpee" },
        { label: "壶铃摇摆", value: "kettlebellSwing" },
        { label: "药球砸墙", value: "medicineBallSlam" },
        { label: "战绳", value: "battleRope" }
      ]
    }

  },
  methods: {
    handlePopup(e) {
      this.setData({ visible: true });
    },
    onVisibleChange(e) {
      this.setData({
        visible: e.detail.visible,
      });
    },
    handleGroupChange(event) {
      console.log('group', event.detail.value);
      this.setData({
        current: event.detail.value,
      });
    },
  },
});
