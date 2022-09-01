const express = require('express')
const path = require('path')
const hbs = require('hbs')

const connection = require('./helpers/connection')
const adminRouter = require('./routes/adminRouter')
const userRouter = require('./routes/userRouter')
const { baceRoot } = require('./controllers/userController')

require('dotenv').config()

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname,'views'))
app.set('view engine', 'hbs')

hbs.registerPartials(path.join(__dirname,'views/partials'))

// database connection
connection()

app.use('/', userRouter)
app.use('/admin', adminRouter)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log('server startted PORT: ' + PORT))
