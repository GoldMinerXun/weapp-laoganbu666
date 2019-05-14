// pages/lab/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showToast({
      title: "loadig...",
      image: "../../images/loading.png",
      mask: true
    })
    wx.setNavigationBarTitle({
      title: '个人中心',
    })

    var that = this
    const defaultArr = ['cloud://laoganbu-02d4d0.6c61-laoganbu-02d4d0/add.png']
    var deal = function () {
      var fileList = defaultArr
      wx.cloud.getTempFileURL({
        fileList,
      }).then(res => {
        that.setData({
          defaultAd: res.fileList[0].tempFileURL
        })
      })
    }
    deal()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideToast()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  }
})