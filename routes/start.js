var express = require('express')
var router = express.Router()



router.get('/find', async function (req, res, next) {
    res.render('find')
})

router.get('/readlike', async function (req, res, next) {
    res.render('readlike')
})

module.exports = router