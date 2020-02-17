const db = require('../database/connection/index')

let runQuery = (db, queryString) => {
    console.log(db.TIME, "runQuery 2")
    db.query(queryString, (error, results, fields) => {
        if (error) {
            console.log("FAILURE")
            console.log(error)
        }
        else {
            console.log("SUCCESS")
            console.log(results)
        }
    })
}

module.exports = runQuery