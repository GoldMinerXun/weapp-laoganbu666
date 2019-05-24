// pages/q_second/index.js
const db = wx.cloud.database()
var util = require('../../utils/util.js')
var app = getApp()
var endtime = new Date();
const comments = db.collection("comments")
const _ = db.command
var shortcomment = ''
// -----2019/5/25 3:14 钟纯情
// 1.采纳实现思路：
// 进入页面即判断该问题是否是提问者访问，如果是的话，该页面将在每个回答下面显示采纳按钮，只能采纳一个回答；
// 
// 2.评论的评论实现思路：
// 每一个回答下面的评论都存进评论表，表中结构如下：
// comments表：
// 某条回答记录中存有reply数组：[（第一条评论与被评论）{
//   评论者id：replyid,
//   被评论者id:bereplyid,
//   评论者name:replyname,
//   被评论者name:bereplyname,
//   评论者头像avator:replyavator,
//   被评论者avator:bereplyavator,
//   评论时间time:replytime,
//   评论内容content:replycontent
// }]
// 更新添加reply数组使用db.collection("comments").doc(记录id).update({
// data:{reply:_.push([以上的对象replyobj])}
// })
// 此处更新始终失败----2019/5/25 目测是数据库读写权限问题，查看相关资料，我觉得是云数据库对创建者写操作的限制，此处建议多查资料
// 
// 3.点赞高并发
// 点赞还未实现
// 目前小程序已经有自己的接口实现10个以上的小程序请求，之前只能在10个以内，我们暂时不考虑高并发情况，如有需要，可将高并发做成请求排队，先到先处理原则进行并发处理
// 
// 4.编辑答案页面
// 编辑答案页面是另一个页面，跳转至文件夹editor-anwser，具体2019/5/25 3:10未完成,可参考q_post完成

Page({
  /**
   * 页面的初始数据
   */
  data: {
    qid: '',
    reviewData: '',
    tempFilePaths: new Array(),
    imagesList: new Array(),
    ansPicture: new Array(),
    ansList: new Array(),
    isShow: false,
    hiddenmodalput: true,
    hasUserInfo: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.id)
    if (app.globalData.userInfo) {
      this.setData({
        hasUserInfo: true
      })
    }
    var that = this
    const defaultArr = ['cloud://laoganbu-02d4d0.6c61-laoganbu-02d4d0/nosolve.png', 'cloud://laoganbu-02d4d0.6c61-laoganbu-02d4d0/solve.png', 'cloud://laoganbu-02d4d0.6c61-laoganbu-02d4d0/yidianzan.png', 'cloud://laoganbu-02d4d0.6c61-laoganbu-02d4d0/dianzan.png']
    var tempArr = new Array()
    var deal = function () {
      var fileList = defaultArr
      wx.cloud.getTempFileURL({
        fileList,
      }).then(res => {
        // console.log(res.fileList)
        res.fileList.forEach(item => {
          tempArr.push(item.tempFileURL)
        })
        that.setData({
          defaultArr: tempArr
        })
      })
    }
    deal()

    wx.showToast({
      title: "loadig...",
      image: "../../images/loading.png",
      mask: true
    })

    this.setData({
      qid: options.id,
      ansLength: this.data.ansList.length
    })
    // db.collection("test").where({ aa: '122' }).update({
    //   data: {
    //     arr: _.push(['ggg'])
    //   }
    // }).then(res => {
    //   console.log(res)
    // })
    // db.collection("test").where({ aa: '122' }).update({
    //   data: {
    //     arr: _.push(['ggg'])
    //   }
    // }).then(res => {
    //   console.log(res)
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    wx.hideToast()
    const options = this.data.qid
    const that = this

    db.collection("questions").where({
      _id: options
    }).get().then(
      res => {
        console.log(res.data[0])
        const fileList = res.data[0].images
        wx.cloud.getTempFileURL({
          fileList
        }).then(result => {
          this.setData({
            // qUserId: res.data[0]._openid,
            // questionData: res.data[0],
            questionTempImage: result.fileList,
            // qAvatarUrl: qAvatarUrl,
            // qNickName: qNickName,
            // state: state
            qData: res.data[0]
          })
        })
      })

    db.collection("comments").where({
      qid: options
    }).get().then(
      res => {
        res.data.map(item => {
          var posttime = new Date(item.time)
          var diff = GetDateTimeDiff(posttime, endtime);
          var strTime = diff.PubTime;
          item.time = strTime
        })
        const ansLength = res.data.length
        wx.getStorage({
          key: 'openid',
          success: function (res1) {
            // console.log(res1.data)
            that.setData({
              localOpenid: res1.data,
              ansLength: ansLength
            })
          },
        })
        res.data.map(item => {
          const fileList = item.compic ? item.compic : false
          if (fileList) {
            wx.cloud.getTempFileURL({
              fileList
            }).then(res => {
              item.compic = res.fileList
            })
          }
        })
        this.setData({
          ansList: res.data
        })
        var arr = new Array()
        db.collection('admires').where({
          qid: options
        }).get().then(result => {
          // console.log(result.data)
          this.setData({
            admireList: result.data
          })
          res.data.map(item => {
            var index = 0
            var flag = false
            result.data.map(items => {
              if (item._id == items.cid && this.data.localOpenid == items._openid) {
                flag = true
              }
            })
            if (flag) {
              arr.push(1)
            } else {
              arr.push(0)
            }
            // console.log(arr)
            that.setData({
              admireArr: arr
            })
          })
        })
      })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var app = getApp()

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  cancel: function () {
    this.setData({
      hiddenmodalput: true
    });
  },
  //确认  
  // 确认提交短评（评论的评论需要做字符长度判断处理，2019/5/25 3:11未完成字符处理）
  confirm: function (e) {
    // console.log(this.data.hasUserInfo)
    this.setData({
      hiddenmodalput: true
    })
    var id = e.currentTarget.dataset.id
    var replyid = app.globalData.openid
    var bereplyid = e.currentTarget.dataset.bereplyid
    var replyname = app.globalData.userInfo.nickName
    var bereplyname = e.currentTarget.dataset.name
    var replyavator = app.globalData.userInfo.avatarUrl
    var bereplyavator = e.currentTarget.dataset.avator
    var replytime = util.formatTime(new Date)
    let replyobj = {
      replyid: replyid,
      bereplyid: bereplyid,
      replyname: replyname,
      bereplyname: bereplyname,
      replyavator: replyavator,
      bereplyavator: bereplyavator,
      replytime: replytime,
      replycontent: shortcomment
    }
    console.log(id, replyid, bereplyid, replyname, bereplyname, replyavator, bereplyavator, replytime)
    if (this.data.hasUserInfo) {
      //BUG： 使用云函数更新字段无效
      wx.cloud.callFunction({
        name:'getreply',
        data:{
          id:id,
          replyobj:replyobj
        }
      }).then(res=>{
        console.log(res)
      }).catch(err=>{
        console.log(err)
      })
      //BUG： 使用非云函数更新字段无效
      // comments.doc(id).update({
      //     data: {
           
      //       reply: _.push([
      //         replyobj
      //       ])
      //     },
      //     success: function (res) {
      //       console.log(res)
      //       this.onLoad()
      //     },
      //     fail: function (err) {
      //       console.log(err)
      //       wx.showModal({
      //         title: '注意',
      //         content: '修改失败，请重试',
      //       })
      //     }
      //   })
    } else {
      wx.showModal({
        title: '注意',
        content: '请先登陆',
        success(res) {
          wx.navigateTo({
            url: '../login/index',
          })
        },
        fail() {

        }
      })
    }

  },
  // modal模态框的输入评论处
  inputcomment: function (event) {
    shortcomment = event.detail.value
  },
  modalinput: function (e) {
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },
  handlePreview: function (e) {
    const index = e.target.dataset.idx
    const fileList = new Array()
    fileList.push(index)
    wx.cloud.getTempFileURL({
      fileList
    }).then(result => {
      const temp = new Array()
      const temps = result.fileList[0].tempFileURL
      temp.push(temps)
      wx.previewImage({
        urls: temp,
      })
    })
  },
  handleImagePreview: function (e) {
    const images = []
    this.data.questionTempImage.map(item => {
      images.push(item.tempFileURL)
    })
    const idx = e.target.dataset.idx
    // console.log(e.target.dataset.idx)
    wx.previewImage({
      current: images[idx], //当前预览的图片
      urls: images, //所有要预览的图片
    })
  },
  handleAdmire: function (e) {
    var that = this
    if (app.globalData.openid) {
      const temp = this.data.admireArr
      temp[e.currentTarget.dataset.index] = 1
      this.setData({
        admireArr: temp
      })
      that.onReady()
      db.collection('admires').add({
        data: {
          admireNickName: app.globalData.userInfo.nickName,
          admireAvatarUrl: app.globalData.userInfo.avatarUrl,
          time: util.formatTime(new Date()),
          cid: e.currentTarget.dataset.cid,
          qid: this.data.qid,
          cuserid: e.currentTarget.dataset.cuserid,
          ccontent: e.currentTarget.dataset.ccontent
        },
        success: function () {
          wx.showToast({
            title: '谢谢你哟',
            image: './thanks.png',
            duration: 500
          })
        }
      })
    } else {
      wx.showModal({
        title: '需要登陆后才可以点赞哦',
        confirmText: '去登录',
        cancelText: '不赞了',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../login/index',
            })
          }
        }
      })
    }
  },
  addpic: function () {
    var that = this
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.setData({
          tempFilePaths: res.tempFilePaths
        })
        // console.log(res.tempFilePaths)
      },
    })
  },
  handleCheck: function (e) {
    const index = e.currentTarget.dataset.idx
    const fileList = this.data.tempFilePaths
    wx.previewImage({
      current: fileList[index], //当前预览的图片
      urls: fileList, //所有要预览的图片
    })

  },

  handleIsShow: function () {
    console.log(this.data.isShow)
    var temp = this.data.isShow
    this.setData({
      isShow: !temp
    })
  }
})


function GetDateTimeDiff(startTime, endTime) {
  var retValue = {};

  var date3 = endTime.getTime() - startTime.getTime(); //时间差的毫秒数

  //计算出相差天数
  var days = Math.floor(date3 / (24 * 3600 * 1000));
  retValue.Days = days;

  var years = Math.floor(days / 365);
  retValue.Years = years;

  var months = Math.floor(days / 30);
  retValue.Months = months;

  //计算出小时数
  var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
  var hours = Math.floor(leave1 / (3600 * 1000));
  retValue.Hours = hours;

  //计算相差分钟数
  var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
  var minutes = Math.floor(leave2 / (60 * 1000));
  retValue.Minutes = minutes;

  //计算相差秒数
  var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
  var seconds = Math.round(leave3 / 1000);
  retValue.Seconds = seconds;

  var strTime = "";
  if (years >= 1) {
    strTime = years + "年前";
  } else if (months >= 1) {
    strTime = months + "个月前";
  } else if (days >= 1) {
    strTime = days + "天前";
  } else if (hours >= 1) {
    strTime = hours + "小时前";
  } else {
    strTime = minutes + "分钟前";
  }
  retValue.PubTime = strTime; //帖子,文章,博客发表时间的一种简短表示方法
  return retValue;
}