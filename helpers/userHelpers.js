require('dotenv/config')

const jwt = require('jsonwebtoken');
const hashPass = require('password-hash');
const otp = require('otp-generator');
const Razorpay = require('razorpay')
const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const User = require('../models/userSchema');

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



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
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, data) {
            if (err) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

function sendOTP(number) {
    number = Number(number)
    client.verify.v2.services('VA466c547cc3b0fa8fc6b0be80979e2648')
        .verifications.create({
            to: `+91${number}`,
            channel: "sms",
        })
        .then((verification) => {
            console.log(verification.status);
        });
}

function verifyOtp(number,otp) {
    number = Number(number)
    otp = Number(otp)
    client.verify.v2
        .services('VA466c547cc3b0fa8fc6b0be80979e2648')
        .verificationChecks.create({ to: `+91${number}`, code: `${otp}` })
        .then((result) => {
            console.log(result)
        }).catch (error => {
            console.log(error);
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
async function genarateRazorpay(orderId, totalValue) {
    return new Promise((resolve, reject) => {
        instance.orders.create({
            amount: totalValue * 100,
            currency: "INR",
            receipt: orderId
        }, function (err, order) {
            if (!err) {
                resolve(order)
            }
        })
    })
}

module.exports = { genarateHashPassword, varifyHashedPassword, createjwtToken, verifyjwtToken, sendOTP, genarateOtp, validationform, genarateRazorpay ,verifyOtp}