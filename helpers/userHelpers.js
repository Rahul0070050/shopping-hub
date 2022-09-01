const jwt = require('jsonwebtoken');
const hashPass = require('password-hash');



async function genarateHashPassword(password) {
    return await hashPass.generate(password)
}

async function varifyHashedPassword(hashedPassword, password) {
    return await hashPass.verify(password, hashedPassword)
}

async function createjwtToken(user) {
    return jwt.sign({username:user.username,email:user.email},process.env.JWT_SECRET_KEY,{expiresIn:20000})
}
async function verifyjwtToken(token) {
    jwt.verify(token,process.env.JWT_SECRET_KEY,(err,data) => {
        if(err) {
            return false
        } else return true
    })
}

module.exports = {genarateHashPassword,varifyHashedPassword,createjwtToken,verifyjwtToken}