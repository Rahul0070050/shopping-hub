const User = require('../models/userSchema')
const Category = require("../models/categorySchema");

module.exports = {
    AdminLogin: (req, res) => {
        try {
            res.render('admin/login', { admin: true })
        } catch (error) {
            console.error(error);
        }
    },
    adminLoginWithData: (req, res) => {
        try {
            const { username, password } = req.body
            if (username == process.env.USERNAME && password == process.env.PASSWORD) {
                res.render('admin/admin_pannel', { admin: true })
            }
        } catch (error) {
            console.error(error)
        }
    },
    getAllUsers: (req, res) => {
        try {
            User.find().then(users => {
                res.render('admin/listUser', { admin: true, users })
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    getSingleUSer: (req, res) => {
        const { id } = req.params
        User.findById(id).then(user => {
            res.render('admin/singleUser', { admin: true, user })
        })
    },
    getProducts: (req, res) => {

    },
    addProduct: (req, res) => {
    },
    getAddProductPage: (req, res) => {
        Category.find({}).then(result => {
            res.render('admin/addProduct', { categories: result })
        })
    },
    addCategory: (req, res) => {
        try {

            const { category } = req.body
            if (category) {
                new Category({
                    name: category
                }).save().then(data => {
                    res.status(200).json({ ok: true, data })
                }).catch(err => {
                    console.log(err.message);
                    res.status(200).json({ ok: false, msg: 'category already exists' })
                })
            } else {
                res.status(406).json({ ok: false, smg: 'category name is invalid' })
            }
        } catch (error) {
            console.log(error.message)
        }
    }
}