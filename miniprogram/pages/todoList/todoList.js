// miniprogram/pages/todoList/todoList.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: "",
      nickName: ""
    },
    todos: [],
    inputValue: '',
    focus: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    this.getTodoList()
  },

  getTodoList(){
    wx.cloud.callFunction({
      name: 'router',
      data: {
        $url: 'todos/getList',
        open_id: app.globalData.open_id
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        todos: res.result.list
      })
    }).catch((e) => {
      console.log(e)
    })
  },

  changeToDos(e){
    let text = e.currentTarget.dataset.text,
      todos = [...this.data.todos],
      current_id, current_completed
    todos.forEach(item=>{
      if(item.text == text){
        current_id = item._id
        current_completed = item.completed = !item.completed
      }
    })
    this.setData({
      todos
    })
    wx.cloud.callFunction({
      name: 'router',
      data: {
        $url: 'todos/createOrUpdate',
        _id: current_id,
        completed: current_completed
      }
    }).then((res) => {
      console.log(res)
    }).catch((e) => {
      console.log(e)
    })
  },

  addTodo(){
    if (!this.data.inputValue){
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      this.closeInput()
      return
    }
    let todos = [...this.data.todos],
      newTodos = [{
        text: this.data.inputValue,
        completed: false
      }]

    wx.cloud.callFunction({
      name: 'router',
      data: {
        $url: 'todos/createOrUpdate',
        text: this.data.inputValue,
        completed: false
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        todos: [...todos, ...newTodos]
      })
      this.closeInput()
    }).catch((e) => {
      console.log(e)
    })
  },
  
  closeInput(){
    this.setData({
      inputValue: '',
      focus: true
    })
  },

  closeItem(e){
    let index = e.currentTarget.dataset.index,
      todos = [...this.data.todos],
      current_id = todos[index]._id
    todos.splice(index, 1)
    this.setData({
      todos
    })
    
    wx.cloud.callFunction({
      name: 'router',
      data: {
        $url: 'todos/delete',
        _id: current_id
      }
    }).then((res) => {
      console.log(res)
    }).catch((e) => {
      console.log(e)
    })
  },

  onInput(e){
    this.setData({
      inputValue: e.detail.value
    })
  }
})