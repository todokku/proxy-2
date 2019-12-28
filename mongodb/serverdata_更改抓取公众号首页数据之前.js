const axios = require('axios')
const dbAction = require('./index')

let serverAction = {}
let loading = { // 是否已经抓取完成（避免多个机器同时请求同一时刻数据
    find: false,
    readlike: false
    
} 

serverAction.cut = (data, num, nowtime) => {
    var tmpArr = []
    for (var i = 0; i < data.length; i += Math.ceil(data.length / num)) {
        tmpArr.push(data.slice(i, i + Math.ceil(data.length / num)))
    }
    var newArr = tmpArr.map((item, index) => {
        item.map(val => (val.wx = index + 1, val.time = nowtime, val.id = Math.random().toString(16).substr(2)))
        return item
    })
    return newArr.flat()
}


serverAction.setWx = async (num) => {
    let wxdata = new Array(~~num).fill(~~num).map((item, index) => ({
        wx: index + 1,
        used: false
    }))
    let result = await dbAction.insertMany('record', wxdata)
    return result.result
}


serverAction.setRecordTime = async (query, data) => {
    let result = await dbAction.updateOne('record', query, data)
    return result.result
}

/**
 * 获取开始时间
 * return => null || {_id, wx, time}
 */
serverAction.getRecordTime = async (query) => {
    let result = await dbAction.findOne('record', query)
    return result
}


serverAction.getReadLikeAll = async () => {
    
    let readLikeDATA = [{
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654382&idx=1&sn=88a879cef9e2dec52f697067abd3d9cf&chksm=bd156ab98a62e3af43779e82baf33f2c58ead60e587a0548cdf8a5d72f8c3b98217ad7782f9f&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654382&idx=2&sn=3fde007525e8e32e32c45c6537a64bf9&chksm=bd156ab98a62e3afbe4acc1b3c38c9da247dede36f3da546ca7c49ea6be8b41d321b74171f0c&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654382&idx=3&sn=bdd7a5deefb64e1ebcabb2769782833f&chksm=bd156ab98a62e3af36b24258f86583142ec6cf2e15bf536bb8c05328dc6c0391c8167ef6290e&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654382&idx=4&sn=5d28fdc11e1a5de621110ecf18d8cded&chksm=bd156ab98a62e3afa7f0c7f5e93832cc95b0568aa1ad4f1ae6068b30da71664aa3116e26710b&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654382&idx=5&sn=4bab6b2a1d4fa9a23c0e619c57521068&chksm=bd156ab98a62e3af2ca6a6685484bd15490562ba7b667bf4e472d2214ca10376b4585b840a63&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654382&idx=6&sn=69a42809c588152a1518f8a97193383f&chksm=bd156ab98a62e3af24543cc3389ee7d91065c2e9d0f1e5b78c369f4b73dbdbc13ac0f1227006&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654374&idx=1&sn=51145f04e3b0a7871ec32bf12369c9a0&chksm=bd156ab18a62e3a7ec175b23cd8e4a4804ad6cf22990e791c809751a5723e9d49fc558ab22ef&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654374&idx=2&sn=fff9067787424fe2f44d9c498eed0d49&chksm=bd156ab18a62e3a7f6dbf0995b6f09cf630c8d2da12085c51da11d91b2104dee54a106ab75a1&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654374&idx=3&sn=2fb36528b647dcbd4bb537f7c006243e&chksm=bd156ab18a62e3a771f88c4cd2e6940ad708f2141cd0362590620ef580997d49cfca185f57af&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654374&idx=4&sn=cda81856eb0436451a7815f0a700acff&chksm=bd156ab18a62e3a7f979c54e231b63fce4baf743beb6318d70a1becc9de3c856f16834aaf539&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654374&idx=5&sn=3d305e53eb15a6b26a02cee80854abac&chksm=bd156ab18a62e3a758b6e529187a9046fbda820353a46f425f0800157c0f5a4fceb89eb7fbbc&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654374&idx=6&sn=14a0a1fac46cd4385c354b989b380e77&chksm=bd156ab18a62e3a7630aaa49fef32886f8f45b0ab3176e3346da032492e254b3ce69888c0741&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654366&idx=1&sn=46455c6f6f32f4049a4765d1d5186a30&chksm=bd156a898a62e39fb715317e746e7b0cc5bed8c6a2fa9e9841c2a2830c0c3f90551ad29218bf&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654366&idx=2&sn=2e77d55a8185d84018c06ed185fffd2d&chksm=bd156a898a62e39f1355258bf24871fdfeed38dc2625c5b02e5621f62c2f3562b47f10aff7de&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654366&idx=3&sn=acde79170cb2b2e6b7bf0e3587d91697&chksm=bd156a898a62e39f78dc887b4cdb995ed60a5462b2da706fe9bc9ab4c22a37af8ac820cf6941&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654366&idx=4&sn=bc054977e30f07b9fd8086ac38a74435&chksm=bd156a898a62e39f0a92ccf2d0bc76471501f016c8fec78216f36e2c366039ad58c5e7037631&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654366&idx=5&sn=7dd18be621d5c22656b8de717015e6be&chksm=bd156a898a62e39f6ac47814462e7ea114e48a721718a0f2cbfdf1e3e87065e9b0a059dc23e9&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654366&idx=6&sn=1d40d4ecf02d4ec1b941ce8d06296b3e&chksm=bd156a898a62e39f248fd053d3be0c664d07e53d98abbcc33e8944759481386b79cb1a8bd558&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654358&idx=1&sn=fe41519fbe0663fefe0077dc59b4cef5&chksm=bd156a818a62e397a3ac93f2c1e0604aff417f486fa70cafaacab614ae66e1747ddab465e86e&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654358&idx=2&sn=ac32ee5c6d50e0d20a9e39a4c4a288ae&chksm=bd156a818a62e39749ed7bc82aa202905266f9f71bda047ef0360476a76e2c7d90d3eaec7564&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654358&idx=3&sn=935112b19c24114207bc1c3e1ef10e79&chksm=bd156a818a62e397225d4b55478a030b2de18ab573c457a1d6ed6587104617cb71f5241b4846&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654358&idx=4&sn=e8a921016ba2262f8901d6e0c0e049ba&chksm=bd156a818a62e397f03b7635f70f517fed3a7f0ade631728c09454988bcde70370f98a92b286&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654358&idx=5&sn=9770b92b67c3b9300a2011c481701c9a&chksm=bd156a818a62e3971bdf91e9b8decc6156e343f421b111261c89966905fa5ea8a1cee79e954c&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654358&idx=6&sn=1653e5b909b161a7613e6c4acede4bc3&chksm=bd156a818a62e397b6bb2503e8ad0514074017725bd5a9e77f14ee0b02e9c78bc15c95e85750&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654350&idx=1&sn=8b87f5d480781efd59e6ab231b5d1e3a&chksm=bd156a998a62e38f3c14ed59548621bf66a61413713763e7a8acd7b8723bdfebd40fda4245e7&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654350&idx=2&sn=b41ddd8a9563ee391abec44d9d8266d8&chksm=bd156a998a62e38ffdcc45cf6295edebc3877221b61347d6a3f4aca0fccb19c600f0ad801cdc&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654350&idx=3&sn=a79c8fb7a38b3a322f38eac3e9e1c697&chksm=bd156a998a62e38f3ad51c3dd76392ad343915de0f48234b15401851dd69bd8af5017c912915&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654350&idx=4&sn=5b4dfd1018dc2eaf0bbe08e7f0f23e5f&chksm=bd156a998a62e38ff101084c8d0d055a15d45ef11c46a6585719955462bcf9a942a0b91d16b5&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654350&idx=5&sn=1d8fa82eac86cbe331a1ff262b42c950&chksm=bd156a998a62e38fe95050c5a806807e30556fbb67700120e32aa85f6efca505ff3f538c5538&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654350&idx=6&sn=74428e738756fca232053c104e1dba19&chksm=bd156a998a62e38f8946c54322a04299ace4dd4ad9e76a9502593624f7e672ad242198d0dfcb&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654323&idx=1&sn=6765c7bf5688c8624301c283375583eb&chksm=bd156ae48a62e3f27c954862ac724a7eb80d307b97c63e93a8c3401c4dbc28fe345987de9b1c&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654323&idx=2&sn=e09e05371d568b6e0cd5370e6a99d0fa&chksm=bd156ae48a62e3f23b5439120c2b1c79421ed0d49ad1949c3488c904fdbfea028f6376b3c171&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654323&idx=3&sn=c65b1073fee1a54b7470fd52f9878711&chksm=bd156ae48a62e3f231355aa56007ca2ee1b52601d0813e98ffba4c1f7fa86f694830c8cf2325&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654323&idx=4&sn=a67b35d59fbc3317326edb1182b42454&chksm=bd156ae48a62e3f2dee08b5419428dd7689bb011fc96fce1e9237cc860c57e92bf1ad30da28c&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654323&idx=5&sn=7857978deab74ea4e68d2b6ea3d49030&chksm=bd156ae48a62e3f2e871974fdc7ff381e3f3d466079cd2f328ba8b52f629912a357e663e1901&scene=27#wechat_redirect"
        }, {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654323&idx=6&sn=76da562d016f69271f1d73302f71b029&chksm=bd156ae48a62e3f2d6848024c9d2b0aedc1e3cb8e23cde9f67b21dce4ed369d2a07d70065321&scene=27#wechat_redirect"
        },



        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzA5MzkwOTgxNg==&mid=2448105100&idx=1&sn=09a3eefd3b02e2154d62e9c99499adbe&chksm=844918dbb33e91cddfe4e026ddd5d1f313040dc3ff333d095d65af7f3b32ce74ac3b7cb51f61&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzA5NTExODU1OQ==&mid=2656003402&idx=1&sn=d033c1706d7de75239c15739c86b3d86&chksm=8bfff0fabc8879ecddf906e879479794335651843590bddf271c513373074f5275a3d530331f&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NzI1MTY0MQ==&mid=2654660664&idx=1&sn=786df934662c0024127f7b0566f694e2&chksm=bd12976e8a651e78de0c05ae8c22e0d921d77a275d9fa6caf4a3ce3dcaf89269880422092fdc&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzIxMjYwMDI5Nw==&mid=2247508688&idx=1&sn=f8a509c1329e120819a11b9aaa125609&chksm=97417656a036ff4070e55fa8237c3028ca371ebce662be4e35b33510ac52545868cc88051827&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NzI1MTY0MQ==&mid=2654660653&idx=1&sn=695ffa548460a049eb3076b4055ac2c4&chksm=bd12977b8a651e6d8dd38fff39d8482cfc56ed8a5b91ad60d9bb3765989c339c56f56e92fe98&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzA3MDI2MjIzNw==&mid=2650552536&idx=1&sn=9e0494661415e46052b90fc40cae1d21&chksm=8737146ab0409d7cd3b9e37ac7e64c5e6f4e7463aefa0205b3bcd76e4306a103c75126b5dbcd&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzU4NDc3MjIyMw==&mid=2247486910&idx=1&sn=7d50f93b38cabe198324ec34846f7cee&chksm=fd95f2aecae27bb837cfbb9263875a764e2c80cacc4a20dfbdf712ae3b6edf86de7aa71ed754&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NzI1MTY0MQ==&mid=2654660646&idx=1&sn=a1da8b85c4eca0deabb79845bf6ffafa&chksm=bd1297708a651e665029636b81630486d98ee78703f1107ed4134f3535976861f10584f4e6e0&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzUxMjAwNTAwMw==&mid=2247512419&idx=1&sn=b537e713b74f08408140ab42c073d5fd&chksm=f969f787ce1e7e91d1003b1deef016148a7de0da151c312cd21d8cb7d10d5d7ff20eb82ceb4c&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzAxNjYwMzMwNw==&mid=2649515402&idx=1&sn=56ba10a7a077927f349164f626103e9f&chksm=83ea844eb49d0d58d293955998d8739c5895a8cbb41ca34f2405cbcfb6444a3af866b7c765ec&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzA3NTAxMTkzOQ==&mid=2650312011&idx=1&sn=62821bce8a5b225625706a54a9885eaa&chksm=877b2f47b00ca651ddfd84c2928082323b7aa7fe5cff6e65a5144552950bfe9cf0e21ca962e9&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5MjY2MzEyMA==&mid=2650873704&idx=1&sn=072360fc53955f0e42e3278d436a233f&chksm=bd576c578a20e5410f298390c6e38e02b78b860a8473da59acb340f02293490625c3414283f5&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5MjgwNTQ1MQ==&mid=2653146272&idx=1&sn=8fd72f64c1ace7b717faa424addda2d2&chksm=bd77cb848a0042925d9893eb097faa81311c413a263eca4b519c888b71daacc46fdff81971f2&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzI0NTgyMDQ3MA==&mid=2247486375&idx=1&sn=6f0a86d249a4132c056c689cd76070ee&chksm=e949f6fede3e7fe8e79b6285b07a5a9fa8558db56f9dccedbd866aeeafa244b07189578a4879&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzI1MTA3MDA5Nw==&mid=2655957954&idx=1&sn=f70736a233300d93e2ba3243ebb05267&chksm=f242803cc535092a8a3670b8d7edcf1ffb35475eff8b011e3a3c6328db168b0beab5b2d6d83d&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzA5NTIyMjQzNg==&mid=2650671734&idx=1&sn=96c66a23cd64d4c03f5a97fae5b76667&chksm=884805bdbf3f8cab9e1ae8226720f7a9f29313c3fb572c51026bf93f39058edcd2866e7285ac&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzAwODY4OTk2Mg==&mid=2652051519&idx=1&sn=1c35a389909ada77852454b4910150b0&chksm=808cb87ab7fb316c8d0ffea6f243485eed49a0eab91944870d1d07334f8d054d3dcd3c1f0091&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NzI1MTY0MQ==&mid=2654660627&idx=1&sn=06d358b1e3837f33b63e51b08dfcb92e&chksm=bd1297458a651e534b49ec818ac3da1b005fe56d0d9ab9e9364bd2817c12d1a9ec296743a4f6&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MTA3NDI5ODU0MQ==&mid=2655799787&idx=1&sn=7f8b2b1c77a4dc2f37292d3399effd57&chksm=738f602944f8e93ff425aaf2c01b6ed9d90922bff3d273a459d560e3ec051cc98bc0a07dd3f8&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651234867&idx=1&sn=93582132977be26f8ee900e75825d287&chksm=bd497bb78a3ef2a167f1b9cf097e158375508312f2b83f8097527fef6117212943dc2f3a600b&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NzI1MTY0MQ==&mid=2654660576&idx=1&sn=1f3d7e6397bf76d52dd03370f1f7a7ca&chksm=bd1298b68a6511a042173a01deaa474ab4cab8dfd8de656b1522c2a602286bfa3cac5b66c415&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzA3MTE2OTgxMw==&mid=2651811721&idx=1&sn=f68b71a51da107c2556e9077adf46f28&chksm=84ca6df3b3bde4e526f63c1d55a32ddda0ebbfae47b189d5f8dabce4591e15645687569eb120&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzU5NTM3NjAzNw==&mid=2247493556&idx=1&sn=11dc3c5765f527c26f91386a69422c85&chksm=fe70457ec907cc688701c2e647338bb917694bd68e37fdacace45157a5bad9807076294e72c8&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5MjgwNTQ1MQ==&mid=2653146261&idx=1&sn=914055dda1394f3c0616d8a59338590b&chksm=bd77cbb18a0042a791a6da7c1fdc2556f941f7fb555845b37802d68071bfd69e0d716610595d&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzIwMTI1OTI3MA==&mid=2840401311&idx=1&sn=7744e624446561d1203480e423745f63&chksm=ba4915f68d3e9ce0b89c1e615c7bb70646b00b5c6f1643b22d3456f7956f9dedfe9cb42f4f74&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzIwMTI1OTI3MA==&mid=2840401311&idx=1&sn=7744e624446561d1203480e423745f63&chksm=ba4915f68d3e9ce0b89c1e615c7bb70646b00b5c6f1643b22d3456f7956f9dedfe9cb42f4f74&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzA5NTExODU1OQ==&mid=2656003334&idx=1&sn=be30fbda659b8af9f3f823342942a415&chksm=8bfff0b6bc8879a0750ad4034c4706efdd52dd888c696e3377cd564e931bf65ba233f32540d0&scene=27#wechat_redirect"
        },
        {
            "msgid": Math.random().toString(16).substr(2),
            "promotion_url": "http://mp.weixin.qq.com/s?__biz=MzIyNzYzNzc1NA==&mid=2247497649&idx=1&sn=db3489d77603515459201c2f4e10b3ab&chksm=e85c9724df2b1e328eaea46d47f973216b41ab6f27969227ec19fa0b53157e310bc30cae36a2&scene=27#wechat_redirect"
        }

    ]

    let readLikeDATA_ = await axios.get('https://www.yundiao365.com/crawler/index/articleLinks')
    
    let num = await dbAction.count('record')

    let nowtime = +new Date

    // dbAction.updateOne()

    
    // let result = await dbAction.insertMany('readlike', serverAction.cut(readLikeDATA.data.data, num, nowtime))
    let result = await dbAction.insertMany('readlike', serverAction.cut(readLikeDATA, num, nowtime))
    return result.result // {ok: 1, n: 3} n=>影响的行数
}

serverAction.getFindAll = async () => {
    let findDATA = await axios.get('https://www.yundiao365.com/crawler/index/publics')
    let findDATA_ = [{
        "id": Math.random().toString(16).substr(2),
        biz: 'MzAxODc5MDQzNA==',
        title: '好好笑哦',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzAxMDU4OTM3Nw==',
        title: '比肉还想',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzU5NTM3NjAzNw==',
        title: '比肉还想1',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MjM5NzI1MTY0MQ==',
        title: '比肉还想2',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MjM5MjgwNTQ1MQ==',
        title: '女子刮出百万大奖，兑奖时却尴尬了…',
        pos: 3, // 位置
        time: 1573791296, //
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzU4NDc3MjIyMw==',
        title: '《犯罪心理》中那些经典的案子（二）',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzA5NTExODU1OQ==',
        title: '比肉还想3',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzA5NTIyMjQzNg==',
        title: '比肉还想4',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzU4NDc3MjIyMw==',
        title: '比肉还想5',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzIxMjYwMDI5Nw==',
        title: '比肉还想6',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzUxMjAwNTAwMw==',
        title: '比肉还想7',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzAwODY4OTk2Mg==',
        title: '比肉还想8',
        pos: 2,
        time: 1573193820
    }]


    let num = await dbAction.count('record')

    let nowtime = +new Date

    // let result = await dbAction.insertMany('find', serverAction.cut(findDATA, Math.ceil(num / 2)))
    let result = await dbAction.insertMany('find', serverAction.cut(findDATA.data.data.splice(0,6), num, nowtime))
    return result.result // {ok: 1, n: 3} n=>影响的行数
}

/**
 * 获取下一条数据
 */

serverAction.getReadLikeNext = async (wx = 1) => {
    // 先判断是否有对应的wx数据， 用来wx等待
    let exist = await dbAction.find('readlike', {
        wx,
    })
    if (!exist.length) return {} // 如果没有这个wx数据，就返回( wx数据 => 每次获取到数据会对数据进行分配对应的微信号 )
    let result = await dbAction.find('readlike', {
        wx,
        finish: {
            $exists: false
        }
    })

    if (!result.length) { // 没有更多数据了

        if (loading.readlike) { // 如果已经有其他机器在请求...
            let finded = await new Promise((resolve, reject) => {
                loading = new Proxy(loading, {
                    set(target, key, value) {
                        if (key == 'readlike' && value == false) {
                            target[key] = value
                            resolve(true)
                        }
                    }
                })
            })
            if (finded) return await serverAction.getReadLikeNext(wx)
        }

        loading.readlike = true


        // 是否1分钟了
        let recordTimeResult = await serverAction.getRecordTime({
            wx,
        })
        // if (recordTimeResult == null)  // 没有取到时间数据
        let nowTime = +new Date
        if (nowTime - recordTimeResult.articletime < 1.5 * 60 * 1000) { // 如果执行完用时不超过10分钟, 则等待

            return await new Promise((resolve, reject) => {
                console.log(`
                
                -----------------
                我正在等待下一次重新获取数据
                -----------------


                `)
                let timer = setTimeout(async () => {
                    clearTimeout(timer)
                    let allResult = await serverAction.getReadLikeAll()
                    if (!allResult.ok) resolve({
                        err: '重新请求后端数据失败'
                    })

                    console.log(`
        
                    -----------------
                    我在等二分钟后才返回哦（意味着最后一篇文章会很久以后才刷新
                    -----------------
                    
                    `)

                    // 更新时间
                    let recordTimeResult = await serverAction.setRecordTime({
                        wx: ~~wx,
                    }, {
                        used: true,
                        articletime: +new Date,
                    })

                    if (!recordTimeResult.ok) resolve({
                        err: '重新记录“开始时间”失败'
                    })

                    loading.readlike = false

                    resolve(await serverAction.getReadLikeNext(wx))

                }, 1.5 * 60 * 1000 - (nowTime - recordTimeResult.articletime))
            })
        } else { // 如果超过5分钟了就重新开始哦
            let allResult = await serverAction.getReadLikeAll()
            if (!allResult.ok) return {
                err: '重新请求后端数据失败'
            }
            // 更新时间
            let recordTimeResult = await serverAction.setRecordTime({
                wx: ~~wx,
            }, {
                used: true,
                articletime: +new Date,
            })

            if (!recordTimeResult.ok) resolve({
                err: '重新记录“开始时间”失败'
            })

            loading.readlike = false

            return await serverAction.getReadLikeNext(wx)
        }
    }

    // 如果有数据
    let data = result[0]

    let updateResult = await dbAction.updateOne('readlike', { // 更新当前数据为 已完成
        id: data.id
    }, {
        finish: 1
    })
    if (!updateResult.result.ok) return {
        err: '更新当前数据为“已完成”状态失败'
    }

    return data
}
 

serverAction.getFindNext = async (wx = 1) => {

    let recordTimeResult = await serverAction.getRecordTime({ // 获取两个时间。 上一次获取的时间，以及开始时间
        wx,
    })

    if (+new Date - recordTimeResult.historyhourtime >= 3600000) { // 如果超过一小时

        return ({
            loading: true
        })

        // 不在这里判断了
        console.log(`

        ---
        我要休息一小时了
        ---
    
        `) 
        return new Promise((resolve, reject) => {
            let waittimer = setTimeout( async () => {
                clearTimeout(waittimer)
                // 更新时间
                let setRecordTimeResult = await serverAction.setRecordTime({
                    wx: ~~wx,
                }, {
                    historyhourtime: +new Date,
                })

                if (!setRecordTimeResult.ok) resolve({
                    err: '重新记录“一小时时间”失败'
                })

                resolve(await serverAction.getFindNext(wx))

            }, 3600000)
        })
    }

    // 先判断是否有对应的wx数据， 用来wx等待
    let exist = await dbAction.find('find', {
        wx,
    })
    if (!exist.length) return {} // 如果没有这个wx数据，就返回( wx数据 => 每次获取到数据会对数据进行分配对应的微信号 )
    let result = await dbAction.find('find', {
        wx,
        finish: {
            $exists: false
        }
    })
 

    if (!result.length) { // 没有更多数据了

        if (loading.find) { // 如果已经有其他机器在请求...
            let finded = await new Promise((resolve, reject) => {
                loading = new Proxy(loading, {
                    set(target, key, value) {
                        if (key == 'find' && value == false) {
                            console.log('k快乐的小鼠标')
                            target[key] = value
                            resolve(true)

                        }
                    }
                })
            })
            if (finded) return await serverAction.getFindNext(wx)
        }

        loading.find = true
        
        // if (recordTimeResult == null)  // 没有取到时间数据
        let nowTime = +new Date
  
        if (nowTime - recordTimeResult.historytime < 5 * 60 * 1000) { // 如果执行完用时不超过10分钟, 则等待

            return await new Promise((resolve, reject) => {

                console.log(`
                
                -----------------
                我正在等待下一次重新获取数据
                -----------------

                `)

                let timer = setTimeout(async () => {
                    clearTimeout(timer)
                    let allResult = await serverAction.getFindAll()
                    if (!allResult.ok) resolve({
                        err: '重新请求后端数据失败'
                    })

                    console.log(`
        
                    -----------------
                    我在等一分钟后才返回哦（意味着最后一篇文章会很久以后才刷新
                    -----------------
                    
                    `)

                    // 更新时间
                    let setRecordTimeResult = await serverAction.setRecordTime({
                        wx: ~~wx,
                    }, {
                        used: true,
                        historytime: +new Date,
                    })

                    if (!setRecordTimeResult.ok) resolve({
                        err: '重新记录“开始时间”失败'
                    })

                    loading.find = false

                    resolve(await serverAction.getFindNext(wx))

                }, 5 * 60 * 1000 - (nowTime - recordTimeResult.historytime))
            })
        } else { // 如果超过5分钟了就重新开始哦

            console.log(`
        
            -----------------
            我重新开始请求数据，重新开始抓取
            -----------------
            
            `)

            let allResult = await serverAction.getFindAll()
            if (!allResult.ok) return {
                err: '重新请求后端数据失败'
            }
            // 更新时间
            let recordTimeResult = await serverAction.setRecordTime({
                wx: ~~wx,
            }, {
                used: true,
                historytime: +new Date,
            })

            if (!recordTimeResult.ok) resolve({
                err: '重新记录“开始时间”失败'
            })

            loading.find = false

            return await serverAction.getFindNext(wx)
        }
    }

    // 如果有数据
    let data = result[0]

    let updateResult = await dbAction.updateOne('find', { // 更新当前数据为 已完成
        id: data.id
    }, {
        finish: 1
    })
    if (!updateResult.result.ok) return {
        err: '更新当前数据为“已完成”状态失败'
    }

    console.log(data, `
    
    ---
    返回findnext结果
    
    `)
    return data
}

serverAction.sendReadLike = async () => {
    setInterval(async () => { // 4分钟上报一次数据

        console.log(`
        
        ---- 开始上报 readlike 数据 ----
        
        `)
        let data = await dbAction.find('handlereadlike', {
            sended: {
                $exists: false
            }
        })

        let newDATA = []
        data.map(item => newDATA.push({
            "msgid": item['_referer'].mid + '_' + item['_referer'].idx,
            "read_num": item.read_num,
            "like_num": item.like_num,
            "release_time": item['_post'].ct,
            "time": +new Date(item.time) / 1000
        }))

        if (data.length) {
            let result = await axios.post('http://yundiao.web.xmchuangyi.com/crawler/index/receiveArticle', {
                data: newDATA
            })
            if (result.data.code == 20000) {
                let update = await dbAction.updateMany('handlereadlike', {
                    _id: {
                        $lte: data[data.length - 1]._id
                    },
                }, {
                    sended: true
                })
                if (!update.result.ok) {} // 如果更新本地数据不成功
            }
        }
    }, 4 * 60 * 1000)
}


/**
 * 更新微信，当前微信被干掉了
 */
serverAction.updateWx = async (wx) => {

    // 获取所有微信号记录
    let recordResult = await dbAction.find('record', {
        wx,
        used: false
    })

    if (recordResult.length) {
        let nextWx = recordResult[0]
        let result = await dbAction.updateMany('readlike', {
            wx,
        }, {
            wx: nextWx.wx
        })
        // 更新当前微信的used
        await dbAction.updateOne('record', {
            wx: nextWx,
        }, {
            used: true
        })

        return result.result
    } else {
        return {
            err: '没有更多微信号咯'
        }
    }
}



serverAction.getHandleFindAll = async () => { // 从本地数据库获取所有处理过的数据
    let readLikeDATA = await dbAction.findAll('handlefind')
    let result = await axios.post('http://yundiao.web.xmchuangyi.com/crawler/index/receivePublic', readLikeDATA)
    if (result.data.code) return result.data // 如果发送数据失败就把错误信息返回
    // 清空已经处理过的数据，用来从来
    let del = await dbAction.deleteMany('handlefind')
    return serverAction.getFindAll()
}

serverAction.getHandleReadLikeAll = async () => { // 从本地数据库获取所有处理过的数据
    let readLikeDATA = await dbAction.findAll('handlereadlike')
    let result = await axios.post('http://yundiao.web.xmchuangyi.com/crawler/index/receiveArticle', readLikeDATA)
    if (result.data.code) return result.data // 如果发送数据失败就把错误信息返回
    // 清空已经处理过的数据，用于重来
    let del = await dbAction.deleteMany('handlereadlike')
    return serverAction.getReadLikeAll()

}

module.exports = serverAction;