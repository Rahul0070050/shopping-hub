const jwt = require('jsonwebtoken');
const hashPass = require('password-hash');
const otp = require('otp-generator');
const User = require('../models/userSchema');

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
function verifyjwtToken(token) {
    return new Promise((resolve,reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, data) {
            if (err) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

function sendOTP(number, otp) {
    return client.messages
        .create({
            body: `hi this is from Shopping hub your OTP: ${otp}`,
            from: +17075988173,
            to: '+91' + number
        })
}


async function genarateOtp() {
    return await otp.generate(6, { digits: true, lowerCaseAlphabets: false, specialChars: false, upperCaseAlphabets: false })
}

async function validationform(username, email, phone) {
    return new Promise(async (resolve, reject) => {
        await User.find({ username }).then(res => {
            if (res.length != 0) {
                resolve('user alresdy exists')
            }
        })
        await User.find({ email }).then(res => {
            if (res.length != 0) {
                resolve('email alresdy exists')
            }
        })
        // checking the user  phone number is exists or not
        // await User.find({phone}).then(res => {
        //     if(res.length != 0) {
        //         resolve('this phone number alresdy exists')
        //     }
        // })
        resolve()
    })
}

module.exports = { genarateHashPassword, varifyHashedPassword, createjwtToken, verifyjwtToken, sendOTP, genarateOtp, validationform }