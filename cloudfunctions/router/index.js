// 云函数入口文件
const TcbRouter = require('tcb-router')
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

exports.main = (event, context) => {
  const app = new TcbRouter({ event })

  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  app.router(['user', 'timer'], async (ctx, next) => {
    ctx.data.company = 'Tencent'
    await next()
  })

  app.router('todos/getList', async (ctx, next) => {
    let res = await new Promise(resolve => {
      db.collection("todos").where({
        open_id: event.userInfo.openId
      }).get().then(res => {
        resolve(res)
      })
    })
    ctx.data.list = res.data

    ctx.body = {
      code: 0,
      success: true,
      list: ctx.data.list
    }
  })

  app.router('todos/createOrUpdate', async (ctx, next) => {
    let res = await new Promise(resolve => {
      let data = Object.assign({}, event)
      if (event._id) {
        //update
        db.collection("todos").doc(event._id).update({
          data: {
            completed: event.completed
          }
        }).then(res => {
          resolve(res)
        })
      } else {
        //create
        db.collection("todos").add({
          data: {
            open_id: event.userInfo.openId,
            text: event.text,
            completed: event.completed || false
          }
        }).then(res => {
          resolve(res)
        })
      }
    })

    ctx.body = {
      code: 0,
      success: true,
      data: res.data
    }
  })

  app.router('todos/delete', async (ctx, next) => {
    let res = await new Promise(resolve => {
      if (event._id) {
        //update
        db.collection("todos").doc(event._id).remove().then(res => {
          resolve(res)
        })
      }else{
        console.error("找不到对应的id")
      }
    })

    ctx.body = {
      code: 0,
      success: true,
      message: "删除成功"
    }
  })

  return app.serve()

}
