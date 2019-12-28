var express = require('express')
var router = express.Router()

var dbAction = require('../mongodb')
var serverAction = require('../mongodb/serverdata')


router.get('/data', async function (req, res, next) {
    res.json(await serverAction.getAll(~~req.query.table))
})

module.exports = router