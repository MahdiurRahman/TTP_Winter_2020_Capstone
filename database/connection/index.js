const mysql = require('mysql')
let config = {
    host: process.env.HOSTNAME,
    user: process.env.USERNAME,
    database: process.env.DBNAME,
    password: process.env.PASSWORD
}

const connection = mysql.createConnection(config)

connection.connect(function(err) {
    if (err) {
        console.error('FAILURE: Error connecting to db: ' + err.stack);
        return;
    }
    console.log('SUCCESS: Connected to db as thread id: ' + connection.threadId);
});

module.exports = connection;