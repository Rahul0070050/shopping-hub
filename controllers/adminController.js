const User = require('../models/userSchema')
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
    }
}