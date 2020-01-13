var MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var dbURL = 'mongodb://localhost:27017';
const dbName = 'wx';

var mongodb;

var dbAction = {}

function connect() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbURL, (err, db) => {
            if (err) {
                console.log(`
                
                --- mongodb 连接失败 ${ err } ---
                
                `)
                reject(err)
            } else {
                console.log(`
                
                --- mongodb 连接成功 --- 
                
                `)
                mongodb = db;
                resolve(true)
            }
        })
    })
}


dbAction.insert = async (collectionName, data) => {
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);
    return await new Promise((resolve, reject) => {
        collection.insertOne(data, (err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}

dbAction.insertOne = async (collectionName, data) => {
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);
    return await new Promise((resolve, reject) => {
        collection.insertOne(data, (err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}

// return { result: {ok: 1, n: 1} }
dbAction.insertMany = async (collectionName, data) => {
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);
    return await new Promise((resolve, reject) => {
        collection.insertMany(data, (err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}


dbAction.updateOne = async (collectionName, query, data) => {
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);
    return await new Promise((resolve, reject) => {
        collection.updateOne(query, {
            $set: data,
        }, {
            upsert: true, // 无则创建
        }, (err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}


// 更新条件都自己写哦
dbAction.updateOne2 = async (collectionName, query, data) => {
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);
    return await new Promise((resolve, reject) => {
        collection.updateOne(query, data, {
            upsert: true, // 无则创建
        }, (err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}

dbAction.updateMany = async (collectionName, query, data) => {
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);
    return await new Promise((resolve, reject) => {
        collection.updateMany(query, {
            $set: data
        }, (err, result) => {

            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}




dbAction.count = async (collectionName) => {
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);
    return await new Promise((resolve, reject) => {
        resolve(collection.find().count())
    })
}

dbAction.page = async (collectionName, page = 0) => {
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);
    return await new Promise((resolve, reject) => {
        collection.find({}).skip(page).limit(1).toArray((err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}

dbAction.find = async (collectionName, query) => {
    if (!mongodb) await connect()
    const db = mongodb.db(dbName)
    const collection = db.collection(collectionName)
    return await new Promise((resolve, reject) => {
        collection.find(query).toArray((err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}



dbAction.findOne = async (collectionName, query) => {
    if (!mongodb) await connect()
    const db = mongodb.db(dbName)
    const collection = db.collection(collectionName)
    return await new Promise((resolve, reject) => {
        collection.findOne(query, (err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}
dbAction.findAndModify = async (collectionName, query, update) => {
    if (!mongodb) await connect()
    const db = mongodb.db(dbName)
    const collection = db.collection(collectionName)
    return await new Promise((resolve, reject) => {
        collection.findAndModify({
            query,
            update,
            upsert: true,
        }, (err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}

dbAction.findOneLast = async (collectionName, query, ) => {
    if (!mongodb) await connect()
    const db = mongodb.db(dbName)
    const collection = db.collection(collectionName)
    return await new Promise((resolve, reject) => {
        collection.find(query).sort({
            _id: -1
        }).limit(1).toArray((err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}


// 草， findone 没找到就 insert， 然后在 update...
dbAction.findOneAndUpdate = async (collectionName, query, update) => {
    if (!mongodb) await connect()
    const db = mongodb.db(dbName)
    const collection = db.collection(collectionName)
    return await new Promise((resolve, reject) => {
        collection.findOneAndUpdate(query, {
            $set: update
        }, {
            upsert: true
        }, (err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}



dbAction.findAll = async (collectionName, query) => {
    let q = query ? query : {}
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);

    return await new Promise((resolve, reject) => {
        collection.find(q).toArray((err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}


dbAction.remove = async (collectionName, query) => {
    let q = query ? query : {}
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);
    return await new Promise((resolve, reject) => {
        collection.remove(q, (err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}

dbAction.deleteMany = async (collectionName, query) => {
    let q = query ? query : {}
    if (!mongodb) await connect();
    const db = mongodb.db(dbName);
    const collection = db.collection(collectionName);
    return await new Promise((resolve, reject) => {
        collection.deleteMany(q, (err, result) => {
            if (err) reject(err)
            if (!err) resolve(result)
        })
    })
}

// dbAction.insert('find', {
//     "biz": "MjM5NjQ5MTI5OA==",
//     "title": "美团BERT的探索和实践",
//     "pos": 1,
//     "time": 1573732692
// })

module.exports = dbAction;

// dbAction.find('collectionname').then(res => console.log(res))


// https://www.compose.com/articles/connection-pooling-with-mongodb/