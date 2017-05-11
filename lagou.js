var log = function(){
    return console.log.apply(console, arguments);
}

//先获取一个库，这个库可以将连接中的代码下载下来
var request = require('sync-request')
var cheerio = require('cheerio')
var fs = require('fs')

//创建一个Web类
class Web{
    constructor(){
        this.company = ''
        this.money = ''
        this.site = ''
        this.time = ''
        this.industry = ''
    }
}

//编写获取所需信息的webFromDiv
var webFromDiv = function(div){
    //先创建一个web岗位的对象
    var web = new Web()
    //获取信息开始啦
    var e = cheerio.load(div)
    web.company = e('.default_list').attr('data-company')
    web.money = e('.default_list').attr('data-salary')
    web.site = e('.add').text()
    web.time = e('.format-time').text()
    web.industry = e('.industry').text()
    log('web', web)
    return web
}


//编写抓取数据的函数websFromUrl
var websFromUrl = function(url){


    //从连接中下载代码,相当于http中的内容,需要请求方法
    var r = request('GET', url)

    //获取到代码的body部分,并转换成utf-8格式
    var body = r.getBody('utf-8')
    //利用cheerio对body的代码进行解析成可以Dom操作的代码
    var e = cheerio.load(body)

    //从文本e中截取包含信息的Dom片段
    var webDiv = e('.con_list_item ')
      // console.log(webDiv.length);
    //有多个结构一样的片段，这是一个数组，我们要的信息都一个里面，需要循环遍历
    var webs = []
    for (var i = 0; i < webDiv.length; i++) {
            // console.log(1);
      //这刚好是包含信息的一个片段
      var div = webDiv[i]
      // log('包含信息的片段', div)
      //调用一个函数webFromDiv来获取需要的信息
      var w = webFromDiv(div)
      // log('w', w)
      webs.push(w)
    }
      return webs
}

var saveJOSN = function(path, ws){
    var s = JSON.stringify(ws, null, 2)
    fs.writeFile(path, s)
}

var websOfGZ = []
var _start = function(){
    //看是函数
    //选取要抓取的页面
    for (var i = 1; i < 31; i++) {
      var url = `https://www.lagou.com/zhaopin/qianduankaifa/${i}/?filterOption=3`
      log('url', url)
      //调用函数从连接中抓取数据，如何抓取的先不管，利用面向对象思想，去抓吧
      var ws = websFromUrl(url)
      websOfGZ = websOfGZ.concat(ws)
    }
    //调用saveJOSN函数将读取到的岗位信息保存在一个文件里
    saveJOSN('广州Web前端招聘岗位.txt', websOfGZ)
}

_start()
