// cloudfunctions/saveWeightRecord/index.js
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event) => {
  const { weight, unit, date, timeOfDay, notes, createdAt } = event
  const db = cloud.database()
  const _ = db.command
  const openid = cloud.getWXContext().OPENID
  
  try {
    // 1. 验证数据
    if (typeof weight !== 'number' || weight <= 0) {
      return {
        code: 400,
        message: '体重值无效，必须为大于0的数字'
      }
    }
    
    if (!['kg', 'lb'].includes(unit)) {
      return {
        code: 400,
        message: '单位无效，只接受 kg 或 lb'
      }
    }
    
    // 2. 准备记录数据
    const weightRecord = {
      _openid: openid,  // 用户标识
      weight,           // 体重数值
      unit,              // 单位
      date: new Date(date), // 测量日期
      timeOfDay,         // 测量时段
      notes: notes || '', // 可选备注
      createdAt: new Date(createdAt), // 记录创建时间
      serverTime: db.serverDate() // 云数据库记录时间
    }
    
    // 3. 保存到体重记录集合
    const result = await db.collection('weight_records').add({
      data: weightRecord
    })
    
    // 4. 检查是否是今天的第一个记录，更新用户最近体重
    await this.updateUserProfile(weightRecord)
    
    return {
      code: 0,
      message: '体重记录保存成功',
      data: {
        id: result._id,
        date: date,
        weight,
        unit
      }
    }
  } catch (err) {
    console.error('保存体重记录失败:', err)
    return {
      code: -1,
      message: '保存体重记录失败',
      error: err.message
    }
  }
}

// 更新用户档案中的最近体重
updateUserProfile = async (record) => {
  const db = cloud.database()
  const _ = db.command
  const openid = cloud.getWXContext().OPENID
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  try {
    // 查找今天是否已有体重记录
    const existingRecord = await db.collection('weight_records')
      .where({
        _openid: openid,
        date: _.and(_.gte(today), _.lt(new Date(today.getTime() + 86400000)))
      })
      .count()
    
    // 如果这是今天的第一条记录，更新用户档案
    if (existingRecord.total === 1) {
      await db.collection('users').where({ _openid: openid }).update({
        data: {
          lastWeight: record.weight,
          lastWeightUnit: record.unit,
          weightUpdatedAt: db.serverDate()
        }
      })
    }
  } catch (err) {
    console.error('更新用户档案失败:', err)
  }
}