// cloudfunctions/getLastWeightRecord/index.js
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event) => {
  const db = cloud.database()
  const _ = db.command
  const openid = cloud.getWXContext().OPENID
  
  try {
    // 获取最近一次体重记录（按日期降序）
    const res = await db.collection('weight_records')
      .where({ _openid: openid })
      .orderBy('date', 'desc')
      .limit(1)
      .get()
    
    if (res.data.length === 0) {
      return {
        code: 0,
        message: '尚无体重记录',
        data: null
      }
    }
    
    const record = res.data[0]
    return {
      code: 0,
      message: '获取成功',
      data: {
        id: record._id,
        weight: record.weight,
        unit: record.unit,
        date: record.date.toISOString().split('T')[0]
      }
    }
  } catch (err) {
    console.error('获取体重记录失败:', err)
    return {
      code: -1,
      message: '获取最近体重记录失败',
      error: err.message
    }
  }
}