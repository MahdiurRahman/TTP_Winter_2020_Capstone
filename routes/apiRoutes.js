const db = require('../database/connection/index')
const bcrypt = require('bcrypt')
const apiRouter = require('express').Router()
const uuid = require('uuid/v4')

let distance = (lat1, lon1, lat2, lon2, unit) => {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
    }
}

// NEW USER
    apiRouter.post('/register', async (req, res) => {
        console.log("/REGISTER:", req.body)
        db.query(`SELECT * FROM users WHERE email='${req.body.email}'`, async (error, results, fields) => {
            if (error) {
                // console.log("BAD: Error")
                res.send("ERROR: Database ran into error when checking duplicate user").status(404)
            }
            else {
                // console.log("results1:", results)
                if (results.length == 0) {
                    // PROCEED
                    // console.log("GOOD: No user with that email")
                    let pswd_encrypted = await bcrypt.hash(req.body.password, 10).then(hash => { return hash })
                    db.query(`INSERT INTO users (firstname, lastname, email, password, lat, lng, open) values ('${req.body.firstname}', '${req.body.lastname}', '${req.body.email}', '${pswd_encrypted}', ${req.body.lat}, ${req.body.lng}, ${req.body.open})`, async (error, results, fields) => {
                        if (error) {
                            res.send("ERROR: Failed to add user").status(404)
                        }
                        else {
                            // console.log("results2:", results)
                            if (results.length == 0) {
                                res.send("ERROR: For some reason, query worked but user wasn't added").status(404)
                            }
                            else {
                                // PROCEED
                                res.send(results).status(200)
                            }
                        }
                    })
                }
                else {
                    // console.log("BAD: User with that email")
                    res.send("ERROR: User with that email already exists").status(404)
                }
            }
        })
    })

// LOGIN
    apiRouter.post('/login', async (req, res) => {
        // console.log(req.body)
        db.query(`SELECT * FROM users WHERE email='${req.body.email}'`, async (error, results, field) => {
            if (error) {
                res.send("ERROR: Encountered error when retrieving user.").status(404)
            }
            else {
                let user = results
                if (results.length == 0) {
                    res.send("ERROR: No user with that email on file.").status(412)
                }
                else {
                    // PROCEED
                    if (bcrypt.compare(req.body.password, results[0].password)) {
                        // Delete Sessions
                        db.query(`DELETE FROM sessions WHERE userId=${results[0].id}`, async (error, results, fields) => {
                            if (error) {
                                // console.log(error)
                                res.send("ERROR: Problem with sessions table.").status(404)
                            }
                            else {
                                // PROCEED
                                // Create new session
                                let new_sessionId = await uuid()
                                let new_expiration = Date.now() + 21600000
                                db.query(`INSERT INTO sessions (sessionId, expires, userId) VALUES ('${new_sessionId}', ${new_expiration}, ${user[0].id})`, async (error, results, fields) => {
                                    if (error) {
                                        res.send("ERROR: Failed to create new session").status(404)
                                    }
                                    else {
                                        // PROCEED
                                        res.send({
                                            user: user,
                                            session: {
                                                id: results.insertId,
                                                sessionId: new_sessionId,
                                                expiration: new_expiration,
                                                userId: user[0].id
                                            }
                                        }).status(200)
                                    }
                                })
                            }
                        })
                    }
                    else {
                        res.send("ERROR: Wrong password").status(412)
                    }
                }
            }
        })
    })

// AUTH --> needs work
    apiRouter.get('/auth', async (req, res) => {
        if (req.body.session) {
            // Find session by id
            let session = await runQuery(`SELECT * FROM sessions WHERE id=${session.id}`)
            if (session) {
                // Check if expired
                const current_time = await Date.now()
                if (req.body.session.expires >= current_time) {
                    // Delete old session
                    let delete_session = await runQuery(`DELETE FROM sessions WHERE id=${session.id}`)
                    if (delete_session) {
                        // Create new session
                        const new_expiration = current_time + 10800000
                        const new_sessionId = await uuid()
                        let new_session = await runQuery(`INSERT INTO sessions (sessionId, expires, userId) VALUES ('${new_sessionId}', ${new_expiration}, ${req.body.user.id})`)
                            //^Possible to combine Delete and Create
                        if (new_session) {
                            const response_object = { user, new_session }
                            res.send(response_object).status(200)
                        }
                        res.send({
                            authStatus: 4,
                            message: "ERROR: failed to add new session."
                        }).status(404)
                    }
                    res.send({
                        authStatus: 3,
                        message: "ERROR: failed to delete old session."
                    }).status(404)
                }
                res.send({
                    authStatus: 2,
                    message: "ERROR: session expired."
                }).status(404)
            }
            res.send({
                authStatus: 1,
                message: "ERROR: session not found."
            }).status(404)
        }
        res.send({
            authStatus: 0,
            message: "ERROR: session information empty."
        }).status(404)
    })

// UPDATE PASSWORD --> needs work

// UPDATE COORDINATES
    apiRouter.post('/user_coordinates', async (req, res) => {
        console.log(req.body)
        db.query(`UPDATE users SET lat=${req.body.lat}, lng=${req.body.lng} WHERE email='${req.body.email}'`, async (error, results, fields) => {
            if (error) {
                res.send("ERROR: Could not update coordinates for user").status(404)
                return
            }
            console.log("Success!")
            res.send(results).status(200)
            return
        })
    })

// UPDATE VEHICLE --> needs work

// NEAREST PARKING
    apiRouter.post('/nearest_parking', async (req, res) => {
        db.query(`SELECT * FROM users`, async (error, results, fields) => {
            if (error) {
                res.send("ERROR: Error calculating closest parking spots").status(404)
            }
            else {
                let answer = []
                for (let i = 0; i < results.length; i++) {
                    let distance_ = distance(req.body.lat, req.body.lng, results[i].lat, results[i].lng)
                    if ((distance_ <= req.body.radius) && (results[i].id != req.body.id)) {
                        answer.push(results[i])
                        console.log(results[i])
                    }
                }
                res.send(answer).status(200)
            }
        })
    })


module.exports = apiRouter