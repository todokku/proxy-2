var helper = require('../../util/helper')
var dbAction = require('../../mongodb')
var serverAction = require('../../mongodb/serverdata')

// 是否所有url都需要替换成 &scene=27#wechat_redirect

module.exports = {
    summary: "阅读点赞数据",

    * beforeSendResponse(requestDetail, responseDetail) {

        var reason = '' // 抓不到数据的原因
        var nonce = '' // 有nonce属性的<script>代码才会执行。
        // var wx = -1; // 哪个微信

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

        // 记录微信账号总个数 
        if (requestDetail.url.indexOf('data.com') != -1) {
            return new Promise((resolve, reject) => {
                serverAction.setWx(helper.postDATA(requestDetail.url).total).then(res => {
                    if (res.ok) console.log(' ------------ 微信账号信息设置成功 ------------ ')
                    serverAction.getReadLikeAll().then(res => {
                        if (res.ok) console.log(' ------------ 待抓取 文章列表 数据获取成功 ------------ ')
                        serverAction.getFindAll().then(res => {
                            if (res.ok) console.log(' ----------- 待抓取 公众号列表 数据获取成功 ----------- ')
                            resolve({
                                response: {
                                    statusCode: 200,
                                    header: {
                                        "Content-Type": "text/html"
                                    },
                                    body: `
                                        <h1>record wechat account success!</h1>
                                        <h1>getreadlike data success!</h1>
                                        <h1>getfind data success!</h1>
                                    `
                                }
                            })
                        })
                    })
                })
            })

        }

        // 历史记录中转
        if (requestDetail.url.indexOf("any2.com") != -1) {

         
            let wx = helper.postDATA(requestDetail.url).wx
            return new Promise((resolve, reject) => {

                serverAction.getFindNext(~~wx).then(result => {
 
                    if (result.err) reject(result.err)
                    if (!Object.keys(result).length) { // 如果返回空对象，表示此wx没数据                    
                        let timer = setInterval(async () => {
                            let next = await serverAction.getFindNext(wx)
                            if (Object.keys(next).length && !next.err) { // 如果有值，且不是错误。否则继续执行循环
                                clearInterval(timer)
                                newResponse.body = ` 
                                    <script nonce="${ nonce }" type="text/javascript">
                                        location.href="https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=${ next.biz }&scene=124&vconsole=1&searchtitle=${ encodeURIComponent(result.title) }&searchtime=${ next.time }&searchpos=${ next.pos }&searchwx=${ wx }#wechat_redirect"
                                    </script>
                                `
                                resolve({
                                    response: newResponse
                                });
                            }
                        }, 10000)

                    } else {
                        // 记录开始时间
                        serverAction.setRecordTime({
                            wx: ~~wx,
                        }, {
                            used: true,
                            historytime: +new Date,
                            historyhourtime: +new Date,
                        }).then(res => {

                            if (!res.ok) reject('Error: 时间存储错误')
                            newResponse.body = `<script nonce="" type="text/javascript">
                                location.href = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=${ result.biz }&scene=124&vconsole=1&searchtitle=${ encodeURIComponent(result.title) }&searchtime=${ result.time }&searchpos=${ result.pos }&searchwx=${ wx }#wechat_redirect'                              
                            </script>`
                            resolve({
                                response: newResponse
                            });
                        })
                    }
                })
            })
        }

        // 文章历史记录
        if (requestDetail.url.indexOf("mp.weixin.qq.com/mp/profile_ext?action=home") != -1) {

            let wx = helper.postDATA(requestDetail.url).wx

            searchDATA = helper.postDATA(requestDetail.url)
            var resDATA = newResponse.body.toString("utf-8")
            if (resDATA.indexOf('操作频繁，请稍后再试') != -1) {

                dbAction.insert('error', Object.assign(result, {
                    type: 'home',
                    time: helper.nowDATE(),
                }))

                return {
                    response: newResponse
                }

                return new Promise((resolve, reject) => {
                    serverAction.updateWx(wx).then(result => { // 先更新一下当前的wx为另一个wx， 在接着刷新
                        if (!result.err) reject(result.err)
                        resolve({
                            response: newResponse
                        })
                    })
                })

            }
            var list = JSON.parse(/var msgList = '(.*)'/g.exec(resDATA)[1].replace(/&quot;/ig, '"')).list // 数组
            result = helper.findArticle(list, searchDATA)


            // 不管有没有成功，先写入数据库
            dbAction.insert('handlefind', Object.assign(result, {
                time: helper.nowDATE(),
                _req: searchDATA
            }))

            // if (result.exist) {
            //     dbAction.insert('handlefind', result)
            // }

            return new Promise((resolve, reject) => {
                console.log(`
                ----- 开始下一轮
                
                `)
                serverAction.getFindNext(~~wx).then(result => {
                    if (result.err) reject(result.err)
                  
                    if (result.loading) {

                        newResponse.body = `
                        
                        <h1> 我累了。你呢。 </h1>
                        <p> 倒计时： <font color="red" id="time"></font>
                        <script>
                            var time = document.querySelector('#time');
                            var t = 3600; 
                            var timer = setInterval(() => {
                                if (t <= 0) {
                                    clearInterval(timer)
                                    location.href="http://any.com/?&wx=${wx}"
                                }
                                t -= 1
                                time.innerHTML = Math.floor(t/60) + '分'  + Math.floor(t%60) + '秒'
                            }, 1000)
                        </script>
                        `
                        resolve({
                            response: newResponse
                        })

                    } else {
                        let rndtime = helper.rdNum(20, 30)*1000

                        newResponse.body = `
                            <p>当前抓取的公众号是: <em> ${searchDATA.title} </em> </p>
                            <div>
                                <code>${JSON.stringify(searchDATA)}</code>
                            </div>
                            <p>${ rndtime }ms 后抓取下一篇</p>
                        
                            <script nonce="" type="text/javascript">
                                window.onload = function() { setTimeout(() => location.href = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=${ result.biz }&scene=124&vconsole=1&searchtitle=${ encodeURIComponent(result.title) }&searchtime=${ result.time }&searchpos=${ result.pos }&searchwx=${ wx }#wechat_redirect', ${ rndtime }) }
                            </script>`
                        resolve({
                            response: newResponse
                        })
                    }
                    
                })
            })
        }

        // 阅读数文章
        if (requestDetail.url.indexOf("mp.weixin.qq.com/s") != -1) {
 
            let wx = helper.postDATA(requestDetail.url).wx
            console.log(wx, '我的微信号')

            if (newResponse.header['Content-Security-Policy']) {
                nonce = newResponse.header['Content-Security-Policy'].match(/nonce-\d+/g)[0].split('-')[1]
            }

            // 阅读数中转
            if (requestDetail.url.indexOf('mp.weixin.qq.com/s?__biz=MzA3NTEzMTUwNA==') != -1) {
                return new Promise((resolve, reject) => {
 
                    serverAction.getReadLikeNext(~~wx).then(result => {
                        if (result.err) reject(result.err)
                        serverAction.sendReadLike() // 开始循环传递数据给后端
                        if (!Object.keys(result).length) { // 如果返回空对象，表示此wx没数据
                            let timer = setInterval(async () => {
                                let next = await serverAction.getReadLikeNext(wx)
                                if (Object.keys(next).length && !next.err) { // 如果有值，且不是错误。否则继续执行循环
                                    clearInterval(timer)

                                    let nextlink = result['promotion_url'].replace(/(#rd|#wechat_redirect)/, '&wx=' + wx + '&id=' + result.id + '&scene=27#wechat_redirect')
                              
                                    newResponse.body += ` 
                                        <script nonce="${ nonce }" type="text/javascript">
                                            window.onload = function() {
                                                setTimeout(() => location.href="${ nextlink }", 30)
                                            }
                                        </script>
                                    `
                                    resolve({
                                        response: newResponse
                                    });
                                }
                            }, 10000)

                        } else {
                            // 记录开始时间
                            serverAction.setRecordTime({
                                wx: ~~wx,
                            }, {
                                used: true,
                                articletime: +new Date,
                            }).then(res => {
                                if (!res.ok) reject('Error: 时间存储错误')
                               
                                let nextlink = result['promotion_url'].replace(/(#rd|#wechat_redirect)/, '&wx=' + wx + '&id=' + result.id + '&scene=27#wechat_redirect')
                              
                                newResponse.body += ` 
                                    <script nonce="${ nonce }" type="text/javascript">
                                        window.onload = function() {
                                            setTimeout(() => location.href="${ nextlink }", 30)
                                        }
                                    </script>
                                `
                                resolve({
                                    response: newResponse
                                });
                            })
                        }
                        
                    })
                })
            }

            if (newResponse.body.toString("utf-8").indexOf('该内容已被发布者删除') != -1) reason = '该内容已被发布者删除'
            if (newResponse.body.toString("utf-8").indexOf('此内容因违规无法查看') != -1) reason = '此内容因违规无法查看'
            if (newResponse.body.toString("utf-8").indexOf('此帐号处于帐号迁移流程中') != -1) reason = '此帐号处于帐号迁移流程中'
            if (newResponse.body.toString("utf-8").indexOf('操作频繁，请稍候再试') != -1) reason = '操作频繁，请稍候再试'
            if (newResponse.body.toString("utf-8").indexOf('访问过于频繁，请用微信扫描二维码进行访问') != -1) reason = '访问过于频繁，请用微信扫描二维码进行访问'
            if (newResponse.body.toString("utf-8").indexOf('此帐号已被屏蔽, 内容无法查看') != -1) reason = '此帐号已被屏蔽, 内容无法查看'

            
            
            if (reason != '') {
                dbAction.insert('handlereadlike', {
                    id: helper.postDATA(requestDetail.url).id,
                    wx: helper.postDATA(requestDetail.url).wx,
                    read_num: -1,
                    like_num: -1,
                    articlereason: reason, // 文章更新失败的原因
                    time: helper.nowDATE(), // 本次更新时间
                })

                if (reason == '操作频繁，请稍候再试') { // 
                    return new Promise((resolve, reject) => {
                        serverAction.updateWx(wx).then(result => { // 先更新一下当前的wx为另一个wx， 在接着刷新
                            if (!result.err) reject(result.err)
                            resolve({
                                response: newResponse
                            })
                        })
                    })
                } 
            }

            return new Promise((resolve, reject) => {
                serverAction.getReadLikeNext(~~wx).then(result => {
                    if (result.err) reject(result.err)

                    let nextlink = result['promotion_url'].replace(/(#rd|#wechat_redirect)/, '&wx=' + wx + '&id=' + result.id + '&scene=27#wechat_redirect')                 

                    newResponse.body += `
                        <script nonce="${ nonce }" type="text/javascript">
                            window.onload = function() {
                                setTimeout(() => location.href="${ nextlink }", ${ helper.rdNum(4, 6)*1000  })
                            }
                        </script>
                    `
                    resolve({
                        response: newResponse
                    });
                })
            })
        }

        // 阅读点赞数据
        if (requestDetail.url.indexOf("mp.weixin.qq.com/mp/getappmsgext") != -1) {

            let postDATA = helper.postDATA(requestDetail.requestData.toString("utf-8"))
            // 格式化请求body，获取对应的数据

            // 返回错误 {"base_resp":{"ret":-2,"errmsg":"invalid args"}}
            // 返回错误 {"base_resp":{"ret":-3,"errmsg":"no session","cookie_count":0},"ret":-3,"errmsg":"no session","cookie_count":0} 

            // 返回正确 {"advertisement_info":[],"appmsgstat":{"show":true,"is_login":true,"liked":false,"read_num":5387,"like_num":46,"ret":0,"real_read_num":0,"version":1,"prompted":1,"like_disabled":false,"style":1,"video_pv":0,"video_uv":0,"friend_like_num":0},"comment_enabled":1,"reward_head_imgs":[],"only_fans_can_comment":false,"comment_count":16,"is_fans":1,"nick_name":"乌拉拉","logo_url":"http:\/\/wx.qlogo.cn\/mmopen\/PiajxSqBRaEJAN9a8tL1fGUTjVicxtHhbyHG4gdYEa60OcbMqJf5alO2VakLbGGzT371z65VcDHIU0jBzciaI8arA\/132","friend_comment_enabled":1,"base_resp":{"wxtoken":777},"more_read_list":[],"friend_subscribe_count":0,"related_tag_article":[],"original_article_count":0,"video_share_page_tag":[],"related_tag_video":[]}

            let refererDATA = helper.postDATA(requestDetail.requestOptions.headers['Referer']) // 获取来源， 提取 wx，id 参数
            let resDATA = JSON.parse(newResponse.body.toString("utf-8"))
            if (postDATA.__biz == 'MzA3NTEzMTUwNA==') {
                return {
                    response: newResponse,
                }
            }
            if (resDATA.base_resp && resDATA.base_resp['errmsg'] != undefined) {
                dbAction.insert('handlereadlike', {
                    id: refererDATA.id,
                    wx: refererDATA.wx,
                    read_num: -1,
                    like_num: -1,
                    datareason: resDATA.base_resp['errmsg'], // 数据更新失败的原因
                    time: helper.nowDATE(), // 本次更新时间
                    _referer: refererDATA, // 来源
                    _post: postDATA, // post数据
                    _res: resDATA, // 返回的数据
                })
            } else {
                dbAction.insert('handlereadlike', {
                    id: refererDATA.id,
                    read_num: resDATA.appmsgstat.read_num,
                    like_num: resDATA.appmsgstat.like_num,
                    datareason: resDATA.base_resp['errmsg'], // 数据更新失败的原因
                    time: helper.nowDATE(), // 本次更新时间
                    _referer: refererDATA, // 来源
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
                    window.onload = function() {
                        setTimeout(() => location.href="http://mp.weixin.qq.com/s?__biz=MzA3NTEzMTUwNA==&mid=2651081567&idx=1&sn=a1c252116b68189791f82d366be9f4f8&chksm=8485d440b3f25d56a7c441dbcc1150acd6b60ad6a3f8f6e8ac3ea0fc340b25bffbc90e281bb8&wx=${wx}", 30)
                    }
                </script>`
                }
            }
        }

    }
}