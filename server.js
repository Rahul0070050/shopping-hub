const express = require('express')
const path = require('path')
const hbs = require('hbs')
const session = require('express-session')
const mongoStore = require('connect-mongo')
const fileUpload = require('express-fileupload')

const connection = require('./helpers/connection')
const adminRouter = require('./routes/adminRouter')
const userRouter = require('./routes/userRouter')

require('dotenv').config()

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  }));
app.use(session({
    secret: 'keyboardcat',
    resave: false,
    name: 'shopping_hub',
    saveUninitialized: true,
    store: mongoStore.create({
        mongoUrl: process.env.MONGOOSE_CONNECTION_STRING,
    }),
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}))

hbs.registerPartials(path.join(__dirname, 'views/partials'))

// database connection
connection()

app.use('/', userRouter)
app.use('/admin', adminRouter)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log('server startted PORT: ' + PORT))


