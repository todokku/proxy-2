const axios = require('axios')
var helper = require('../../util/helper')
var dbAction = require('../../mongodb')
var serverAction = require('../../mongodb/serverdata')

// 是否所有url都需要替换成 &scene=27#wechat_redirect

module.exports = {
    summary: "阅读点赞数据",
    * beforeSendResponse(requestDetail, responseDetail) {

        var reason = '' // 抓不到数据的原因
        var nonce = '' // 有nonce属性的<script>代码才会执行。

        let isJPG = /^image\/(jpeg|gif|png|webp)/.test(
            requestDetail.requestOptions.headers["Accept"]
        ) || /^image\/(jpeg|gif|png|webp)/.test(
            requestDetail.requestOptions.headers["Content-Type"]
        )
        let isCSS = /^text\/css/.test(requestDetail.requestOptions.headers["Accept"])
        let isSite0 = requestDetail.url.indexOf('badjs.weixinbridge.com') != -1
        let isSite1 = requestDetail.url.indexOf('google.com') != -1
        let isSite2 = requestDetail.url.indexOf('microsoft.com') != -1
        let isSite3 = requestDetail.url.indexOf('v.qq.com') != -1
        let isSite4 = requestDetail.url.indexOf('video.qq.com') != -1
        if (isJPG || isSite0 || isSite1 || isSite2 || isSite3 || isSite4) {
            return {
                response: {
                    statusCode: 200,
                    header: {
                        "Content-Type": "image/png"
                    },
                    body: ""
                }
            };
        }

        let newResponse = responseDetail.response;
        // 公众号主页数据
        if (requestDetail.url.indexOf("mp.weixin.qq.com/mp/profile_ext?action=home") != -1) {
            let wx = helper.postDATA(requestDetail.url).wx
            var resDATA = newResponse.body.toString("utf-8") // response数据 （有gbk编码?)
            if (resDATA.indexOf('操作频繁，请稍后再试') != -1) {
                dbAction.insertOne('error_wx', {
                    time: helper.nowDATE(),
                    type: 'home',
                    wx,
                    machine_num: wx,
                    reason: '操作频繁，请稍后再试'
                })
                // 释放资源
                return new Promise(async (resolve, reject) => {
                    await axios.get(`https://www.yundiao365.com/crawler/index/publics?&machine_num=${wx}&limit_num=0`).catch(async err => {
                        return await serverAction.recordErrNet(err, 'getFindAll').catch(err => ({
                            error: true
                        }))
                    })
                    await axios.get(`https://www.yundiao365.com/crawler/index/gameOver?machine_num=${wx}&type=2`).catch(async err => {
                        return await serverAction.recordErrNet(err, 'sendGameOver').catch(err => ({
                            error: true
                        }))
                    })

                    newResponse.body += `<p>停止时间：<font color="red">${ helper.nowDATE() }</font><p>`
                    resolve({
                        response: newResponse
                    })
                })

            }

            if (resDATA.indexOf('msgList') != -1) { // 判断一下，是否有数据（因为除了操作频繁可能会遇到其他错误，那就跳过数据获取，进入下一条数据获取
                var token = /var username = (.*);/.exec(resDATA)[1].replace(/"| /ig, '').split('||')[1] // token
                var data = JSON.parse(/var msgList = '(.*)'/g.exec(resDATA)[1].replace(/&quot;/ig, '"').replace(/amp;/ig, '')).list // 数据
                dbAction.insert('handlefind', {
                    time: helper.nowDATE(),
                    biz: helper.postDATA(requestDetail.url).__biz + '==',
                    token,
                    data,
                    wx,
                    machine_num: wx,
                })
            }

            return new Promise(async (resolve, reject) => {
                let findDATA = await serverAction.getFindNext(~~wx)
                if (findDATA.timeout || findDATA.nothing) { // 如果需要倒计时...(当前数据库列表的数据都已经抓取完成)
                    let action = findDATA.timeout ? 'timeout' : 'nothing'
                    newResponse.body = `
                            <style> 
                                #top {z-index: 999; position: fixed; left: 0; bottom: 0; width: 100%; background: #f00; color: #fff; word-break: break-all; padding: 10px; box-sizing: border-box }
                            </style>
                            <h2 id='top'>这里是最后一条数据啦。一轮完成啦。</h2>
                            <script nonce="${ nonce }" type="text/javascript">
                                setTimeout(() => location.href="http://127.0.0.1/find?action=${action}&wx=${ wx }",  3000) // 3秒后才跳转， 确保抓到数据
                            </script>
                        `
                    resolve({
                        response: newResponse
                    })
                } else {
                    let rndTime = helper.rdNum(20, 30) * 1000
                    newResponse.body = `
                        <h1>当前抓取的公众号是: <em> ${helper.postDATA(requestDetail.url).__biz} </em> </h1>
                        <p><font color="red" id="time">${ rndTime / 1000 }s</font>后抓取下一公众号 ${findDATA.biz} </p>
                        <script type="text/javascript">
                            window.onload = function() { setTimeout(() => location.href = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=${ findDATA.biz }&scene=124&searchwx=${ wx }#wechat_redirect', ${ rndTime }) }
                        </script>`
                    resolve({
                        response: newResponse
                    })
                }
            })
        }

        // 阅读数文章
        if (requestDetail.url.indexOf("mp.weixin.qq.com/s") != -1) {
            let wx = ~~helper.postDATA(requestDetail.url).wx
            let resContent = newResponse.body.toString("utf-8")
            if (newResponse.header['Content-Security-Policy']) {
                nonce = newResponse.header['Content-Security-Policy'].match(/nonce-\d+/g)[0].split('-')[1]
            }
            if (resContent.indexOf('该内容已被发布者删除') != -1) reason = '该内容已被发布者删除'
            if (resContent.indexOf('此内容因违规无法查看') != -1) reason = '此内容因违规无法查看'
            if (resContent.indexOf('此帐号处于帐号迁移流程中') != -1) reason = '此帐号处于帐号迁移流程中'
            if (resContent.indexOf('操作频繁，请稍候再试') != -1) reason = '操作频繁，请稍候再试'
            if (resContent.indexOf('访问过于频繁，请用微信扫描二维码进行访问') != -1) reason = '访问过于频繁，请用微信扫描二维码进行访问'
            if (resContent.indexOf('此帐号已被屏蔽, 内容无法查看') != -1) reason = '此帐号已被屏蔽, 内容无法查看'
            let query = helper.postDATA(requestDetail.url)
            if (reason != '') {
                dbAction.insertOne('error_wx', {
                    time: helper.nowDATE(),
                    type: 'readlike',
                    wx,
                    reason,
                })
                if (reason == '此内容因违规无法查看') {
                    // var getReason = resContent.match(/<p class="tips">(.*)<a/)[1].match(/[\u2E80-\u9FFF]+/g)
                    // reason += '，原因：' + getReason.slice(1, getReason.length - 1).join('或')
                    reason += '，原因：' + resContent.match(/<p class="tips">(.*)<a/)[1].replace('，查看', '')
                }
                dbAction.insert('handlereadlike', {
                    unique: ~~query.unique,
                    wx: ~~query.wx,
                    biz: helper.postDATA(requestDetail.url).__biz + '==',
                    order_id: ~~query.order_id,
                    msgid: query.mid + '_' + query.idx,
                    error: reason, // 文章更新失败的原因
                    time: helper.nowDATE(), // 本次更新时间
                })
                if (reason == '操作频繁，请稍候再试' || reason == '访问过于频繁，请用微信扫描二维码进行访问') { // 如果操作频繁。就返回错误，表示此微信也不可用
                    return new Promise(async (resolve, reject) => {
                        await serverAction.getReadLikeAll(wx, 0).catch(err => console.log(err)) // 回收资源
                        await axios.get(`https://www.yundiao365.com/crawler/index/gameOver?machine_num=${wx}&type=1`).catch(async err => {
                            return await serverAction.recordErrNet(err, 'sendGameOver').catch(err => ({
                                error: true
                            }))
                        })
                        newResponse.body += `<p>停止时间：<font color="red">${ helper.nowDATE() }</font><p>`
                        resolve({
                            response: newResponse
                        })
                    })
                }


            }

            return new Promise(async (resolve, reject) => {
                let nextReadLikeDATA = await serverAction.getReadLikeNext(~~wx)
                if (nextReadLikeDATA.nothing || nextReadLikeDATA.waiting || nextReadLikeDATA.timeout) { // 如果没数据，<del>或者在等待~</del>(因为在过渡页处理了) 就返回前台页面
                    let action = ''
                    if (nextReadLikeDATA.nothing) action = 'nothing'
                    if (nextReadLikeDATA.waiting) action = 'waiting'
                    if (nextReadLikeDATA.timeout) action = 'timeout'

                    let bodycontent = newResponse.body.toString("utf-8")

                    bodycontent = bodycontent.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, '') // 去除img

                    // 头部注入js， 防止注入底部不执行（页面其他js报错
                    bodycontent = bodycontent.replace(/(.{0})/, ` 
                        <style>
                           
                            #top {z-index: 999; position: fixed; left: 0; bottom: 0; width: 100%; background: #f00; color: #fff; word-break: break-all; padding: 10px; box-sizing: border-box }
                        </style>
                        <h2 id='top'>这里是最后一条数据啦。一轮完成啦。</h2>
                        <script nonce="${ nonce }" type="text/javascript">
                            setTimeout(() => location.href="http://127.0.0.1/readlike?action=${action}&wx=${ wx }",  3000) // 3秒后才返回， 确保这一条拿到数据
                        </script>
                    `)
                    newResponse.body = bodycontent
                    resolve({
                        response: newResponse
                    })
                } else {

                    let nextlink = nextReadLikeDATA['promotion_url'].replace(/amp;/ig, '').replace(/(#rd|#wechat_redirect)/, `&wx=${wx}&order_id=${nextReadLikeDATA.order_id}&unique=${nextReadLikeDATA.unique}&nowtime=${ +new Date }&scene=27#wechat_redirect`)

                    let bodycontent = newResponse.body.toString("utf-8")

                    bodycontent = bodycontent.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, '') // 去除img

                    // 头部注入js， 防止注入底部不执行（页面其他js报错
                    bodycontent = bodycontent.replace(/(.{0})/, ` 
                        <style>
                          
                            #top {z-index: 999; position: fixed; left: 0; bottom: 0; width: 100%; background: #f00; color: #fff; word-break: break-all; padding: 10px; box-sizing: border-box }
                        </style>
                        <h2 id='top'>下一条链接地址：${nextlink}</h2>
                        <script nonce="${ nonce }" type="text/javascript">
                            setTimeout(() => location.href="${ nextlink }", ${ helper.rdNum(9, 10)*1000 })
                        </script>
                    `)

                    newResponse.body = bodycontent

                    resolve({
                        response: newResponse
                    });
                }
            })
        }

        // 阅读点赞数据
        if (requestDetail.url.indexOf("mp.weixin.qq.com/mp/getappmsgext") != -1) {

            let postDATA = helper.postDATA(requestDetail.requestData.toString("utf-8"))
            // 格式化请求body，获取对应的数据

            // 返回错误 {"base_resp":{"ret":-2,"errmsg":"invalid args"}}
            // 返回错误 {"base_resp":{"ret":-3,"errmsg":"no session","cookie_count":0},"ret":-3,"errmsg":"no session","cookie_count":0} 

            // 返回正确 {"advertisement_info":[],"appmsgstat":{"show":true,"is_login":true,"liked":false,"read_num":5387,"like_num":46,"ret":0,"real_read_num":0,"version":1,"prompted":1,"like_disabled":false,"style":1,"video_pv":0,"video_uv":0,"friend_like_num":0},"comment_enabled":1,"reward_head_imgs":[],"only_fans_can_comment":false,"comment_count":16,"is_fans":1,"nick_name":"乌拉拉","logo_url":"http:\/\/wx.qlogo.cn\/mmopen\/PiajxSqBRaEJAN9a8tL1fGUTjVicxtHhbyHG4gdYEa60OcbMqJf5alO2VakLbGGzT371z65VcDHIU0jBzciaI8arA\/132","friend_comment_enabled":1,"base_resp":{"wxtoken":777},"more_read_list":[],"friend_subscribe_count":0,"related_tag_article":[],"original_article_count":0,"video_share_page_tag":[],"related_tag_video":[]}

            let refererDATA = helper.postDATA(requestDetail.requestOptions.headers['Referer']) // 获取来源， 提取 wx，unique 参数

            let resDATA = JSON.parse(newResponse.body.toString("utf-8"))

            if (resDATA.base_resp && resDATA.base_resp['errmsg'] != undefined) {
                dbAction.insert('handlereadlike', {
                    unique: ~~refererDATA.unique,
                    wx: ~~refererDATA.wx,

                    order_id: ~~refererDATA.order_id,
                    error: resDATA.base_resp['errmsg'], // 数据更新失败的原因
                    time: helper.nowDATE(), // 本次更新时间 
                    _post: postDATA, // post数据
                    _res: resDATA, // 返回的数据
                })
            } else {
                dbAction.insert('handlereadlike', {
                    unique: ~~refererDATA.unique,
                    wx: ~~refererDATA.wx,
                    order_id: ~~refererDATA.order_id,
                    read_num: resDATA.appmsgstat.read_num,
                    like_num: resDATA.appmsgstat.like_num,
                    time: helper.nowDATE(), // 本次更新时间 
                    _post: postDATA, // post数据
                    _res: resDATA, // 返回的数据
                })
            }
        }
        return {
            response: newResponse,
        }
    },

    * onError(requestDetail, error) {
        if (requestDetail.url.indexOf('mp.weixin.qq.com/s') != -1) {
            let wx = helper.postDATA(requestDetail.url).wx
            return {
                response: {
                    statusCode: 200,
                    header: {
                        'content-type': 'text/html'
                    },
                    body: `<script nonce="" type="text/javascript">
                        setTimeout(() => location.href="http://127.0.0.1/readlike?&wx=${wx}", 30)
                    </script>`
                }
            }
        }
        if (requestDetail.url.indexOf('mp.weixin.qq.com/profile_ext?action=home') != -1) {
            let wx = helper.postDATA(requestDetail.url).wx
            return {
                response: {
                    statusCode: 200,
                    header: {
                        'content-type': 'text/html'
                    },
                    body: `<script nonce="" type="text/javascript">
                        setTimeout(() => location.href="http://127.0.0.1/find?&wx=${wx}", 30)
                    </script>`
                }
            }
        }
    }
}