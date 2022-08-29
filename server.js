const express = require("express")
const path = require("path")
const connection = require("./helpers/connection")
require('dotenv').config()

const app = express()

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))

connection()


const PORT = process.env.PORT || 8000
app.listen(PORT,() => console.log("server startted PORT: "+PORT))