const express = require('express')
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const PORT = process.env.PORT || 8000
const loginRoutes = require('./routes/login')
const authRoutes = require('./routes/info')
var cookieParser = require('cookie-parser')
app.use(cookieParser())

dotenv.config()
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log('connected to mongoose')
})

app.use(express.json())
app.use('/user', loginRoutes)
app.use('/auth', authRoutes)
app.listen(PORT, () => {
    console.log('Listening to port ' + PORT)
})