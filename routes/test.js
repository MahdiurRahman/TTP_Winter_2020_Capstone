const db = require('../database/connection/index')
const bcrypt = require('bcrypt')

let runQuery = queryString => {
    console.log(db.TIME, "runQuery")
    db.query(queryString, (error, results, fields) => {
        if (error) {
            console.log("FAILURE")
            console.log(error)
            return error
        }
        else {
            console.log("SUCCESS")
            console.log(results)
            return results
        }
    })
}

// runQuery('CREATE TABLE cars (id int not null auto_increment primary key, model varchar(255), price int)')
// runQuery('INSERT INTO cars VALUES (\"nissan ultima\", 20050)')
// runQuery('SELECT * FROM cars')

// SETUP TABLES
// vehicles
    // runQuery('CREATE TABLE vehicles (id int not null auto_increment primary key, model varchar(255), year int, length float(4, 2))');
    // runQuery("INSERT INTO vehicles (model, year, length) VALUES ('lambo', 2015, 15.5)");
    // runQuery("DELETE FROM vehicles WHERE model='lambo'")
    // runQuery('SELECT * FROM vehicles')
    // runQuery('DROP TABLE vehicles')

// users
    // runQuery('CREATE TABLE users (id int not null auto_increment primary key, firstname varchar(255), lastname varchar(255), email varchar(255), password varchar(255), lat double(15, 12), lng double(15, 12), open bool)');
    // runQuery('SELECT * FROM users')
    // runQuery("DELETE FROM users WHERE firstname='Samuel'")
    // runQuery('DROP TABLE users')
    // runQuery("INSERT INTO users (firstname, lastname, email, password, lat, lng, open) VALUES ('john', 'smith', 'john@email.com', 'password', 11.11, 11.11, 1)")
    // let x = 'john@email.com'
    // let a = runQuery(`SELECT * FROM users WHERE email='bsbsbs'`)
    // console.log(a)
    runQuery("SELECT * FROM users")
    // runQuery(`UPDATE users SET lat=${40.7563846}, lng=${-73.8225461} WHERE email='sam@email.com'`)

// sessions
    // runQuery("CREATE TABLE sessions (id int not null auto_increment primary key, sessionId varchar(255), expires bigint, userId int, FOREIGN KEY (userId) REFERENCES users(id))")
    // runQuery("INSERT INTO sessions (sessionId, expires, userId) VALUES ('abc123', 1000, 1)")
    // runQuery("SELECT * FROM sessions")
    // runQuery("DROP TABLE sessions")