const express = require('express')
const session = require('express-session')
const passport = require('passport')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 8080
const apiRoutes = require('./routes/apiRoutes')
//const db = require('./database/connection')

// Testing DB Route:
    require('./routes/test')

/*
-create acc
-update car
-update coordinates
*/

// MIDDLEWARES:
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*"); 
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});


app.get('/', (req, res) => {
    res.send("API Homepage")
})

app.use('/api', apiRoutes)

app.listen(PORT, () => console.log(`Listening on localhost:${PORT}`))