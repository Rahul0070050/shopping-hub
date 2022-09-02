const jwt = require('jsonwebtoken');
const hashPass = require('password-hash');
const otp = require('otp-generator')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
require('dotenv/config')

const client = require('twilio')(accountSid, authToken);


async function genarateHashPassword(password) {
    return await hashPass.generate(password)
}

async function varifyHashedPassword(hashedPassword, password) {
    return await hashPass.verify(password, hashedPassword)
}

async function createjwtToken(user) {
    return jwt.sign({ username: user.username, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: 20000 })
}
async function verifyjwtToken(token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
        if (err) {
            return false
        } else return true
    })
}

function sendSMS(number) {
    return client.messages
        .create({
            body: 'hi',
            from: +17075988173,
            to: '+91' + number
        })
}


async function genarateOtp() {
    // return await otp.generate(6,{digits:true,lowerCaseAlphabets:false,specialChars:false,upperCaseAlphabets:false})

}


module.exports = { genarateHashPassword, varifyHashedPassword, createjwtToken, verifyjwtToken, sendSMS, genarateOtp}