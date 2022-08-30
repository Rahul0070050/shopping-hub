module.exports = {
    baceRoot: (req,res) => {
        console.log('hi');
        // res.render()
    },
    signup: (req,res) => {
        res.render('user/signup')
    },
    registration: (req,res) => {
        console.log(req.body);
    },
}