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
    }
}