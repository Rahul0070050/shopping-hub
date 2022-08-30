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

// landing page => GET 'http://localhost:3000' Users can search products and add to cart(temp) and see detailed view of a products
app.get('/', baceRoot)
app.use('/admin', adminRouter)
app.use('/user', userRouter)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log('server startted PORT: ' + PORT))
