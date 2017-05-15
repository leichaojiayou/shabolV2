var app = getApp(),
    util = require('../../utils/util.js'),
		UT = require('../../utils/request.js');
Page({
  data:{
    list:[],
    messages:[],
    showSelectCity:true,
    provinceId: '',
    province: '',
    page: 1,
    loading:true,
    loadMore:true,
    end:false,
    activeIndex: -1,
    search: '搜索货源',
    scrollStatus:true,
    lastMessageId: ''
  },
  onLoad:function(options){
    var cityList = wx.getStorageSync('cityList')
    if(cityList){
      this.setData({
        list:cityList
      })
    }else{
      this.getCityList()
    }
  },
  getCityList () {  // 获取省份列表
    var that = this
    wx.request({
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'getcitylist',
        ts:+ new Date()
      },
      success:function(res){
        that.setData({
          list:res.data.data
        })
        wx.setStorage({  // 缓存省份
          key:'cityList',
          data:res.data.data
        })
      }
    })
  },
  getCargoList () {  // 获取省份搜索信息
    var that = this
    wx.request({
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'getcitycargolist',
        provinceId:that.data.provinceId,
        page:that.data.page,
        ts:+ new Date()
      },
      success:function(res){
        var c = []
        var data = res.data.data
        for (let key in data) {
          c.unshift(data[key])
        }
        for (let key in c) {
          c[key].add_time = that.getLocalTime(c[key].add_time)
        }
        // var a = that.data.province
        // var replaceText = `<span class="keyWord">${a}</span>`
        // for (let key in c) {
        //   if(c[key].user_content.indexOf(a)){
        //     c[key].user_content = c[key].user_content.replace(a,replaceText)
        //   }
        // }
        that.setData({
          messages:c,
          lastMessageId:'maxlength',
          loading:true
        })
      }
    })
  },
  loadMore () { // 加载更多
    if(app.load) return
    app.load = true
    var that = this
    var id = that.data.messages[0].id
    that.setData({
				page:that.data.page + 1,
        loadMore:false,
        scrollStatus:false
			})
    wx.request({  // 省份筛选
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'getcitycargolist',
        provinceId:that.data.provinceId,
        page:that.data.page,
        ts:+ new Date()
      },
      success:function(res){
        if(res.data.data.info !== 2){
          var c = []
          for (let key in res.data.data) {
            c.unshift(res.data.data[key])
          }
          for (let key in c) {
            c[key].add_time = that.getLocalTime(c[key].add_time)
          }
          that.setData({
            messages:c.concat(that.data.messages)
          })
          setTimeout(() => {
            that.setData ({
              lastMessageId :'item_' + id,
              loadMore:true,
              scrollStatus:true
            })
          }, 0)
        } else {
          that.setData({
            end:true,
            loadMore:true,
            scrollStatus:true
          })
        }
        app.load = false
      }
    })
  },
  getLocalTime (date) {  // 转换时间
    var past = new Date(parseInt(date)*1000)
    var now = new Date()
    var yestoday = new Date() - 24*60*60*1000
    var time = (now-past)/1000
    if (new Date(past).toDateString() === new Date().toDateString()) {
      return '今天'
    } else if((now.getDate() - 1) === past.getDate()){
      return '昨天'
    } else {
      var m = (past.getMonth()+1 < 10 ? '0'+(past.getMonth()+1) : past.getMonth()+1)
      var d = (past.getDate() < 10 ? '0'+(past.getDate()) : past.getDate())
      return m + '月' + d + '日'
    }
  },
  makePhoneCall:function(e){ // 拨打电话
    var item = e.target.dataset.item
    var contetn = e.target.dataset.content
    wx.makePhoneCall({
      phoneNumber:item,
      success:function(){
        util.analytics({
          t:'event',
          ec:'点击拨打货源电话',
          ea:content,
          el:item
    		})
      }
    })
  },
  selectedItem (e) { // 选择省份
    if(e.target.dataset.item == this.data.province) return
    this.setData({
      provinceId:e.target.dataset.id,
      province:e.target.dataset.item,
      activeIndex:e.target.dataset.index,
      page:1,
      end:false,
      search:e.target.dataset.item,
      messages: [],
      showSelectCity:false,
      loading:false
    })
    this.getCargoList()
  },
  closeShow () {  // 点击关闭弹层
    this.setData({
      showSelectCity:false
    })
  },
  showSearch () { // 显示弹层
    this.setData({
      showSelectCity:true
    })
  },
  carToEdit () {  // 发布车源
    wx.navigateTo({
      url:'../add/add?edit=2'
    })
  },
  toUpper:function(){ // 下拉加载
    if(this.data.end) return
    this.loadMore()
  }
})