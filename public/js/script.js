let usernameErr = document?.getElementById('usernameErr')
let passwordErr = document?.getElementById('passwordErr')
let emailErr = document?.getElementById('emailErr')
let cunfirmPasswordErr = document?.getElementById('cunfirmPasswordErr')
let phoneErr = document?.getElementById('phoneErr')



// top login
const countDown = document?.getElementById('count-down');
const inputField = document?.getElementById('form-control');
const spanSpinner = document?.getElementById('span-spinner');
const submitButton = document?.getElementById('sibmit-btn');
const resendOtp = document?.getElementById('resend-otp');
const otpLogin = document?.querySelector('#otp-login')

function otp() {
    otpLogin.style.opacity = '1'
    otpLogin.style.zIndex = '7'
    function otpTimer() {
        let counter = 60
        inputField.focus()
        let timer = setInterval(() => {
            countDown.innerText = counter < 10 ? `0:0${--counter}` : `0:${--counter}`
            if (counter <= 0) {
                clearInterval(timer)
                submitButton.setAttribute('disabled', true)
                inputField.setAttribute('disabled', true)
                inputField.classList.add('is-invalid')
            }
        }, 1000)
        return timer
    }
    resendOtp.addEventListener('click', () => {
        clearInterval(timer)
        timer = otpTimer()
    })
    let timer = otpTimer()
    submitButton.addEventListener('click', () => {
        //
    })
    inputField.addEventListener('keyup', (e) => {
        let value = e.target.value;
        if (value.length == 6) {
            clearInterval(timer)
            submitButton.setAttribute('disabled', true)
            inputField.setAttribute('disabled', true)
            spanSpinner.classList.add('spinner-border', 'spinner-border-sm')
            fetch('/user/checkotp', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    otp: value
                }),
                credentials: 'include'
            }).then(res => res.json()).then(res => {
                console.log(res)
                if (res.ok) {
                    let a = document.createElement('a');
                    a.setAttribute('href', '/')
                    a.click()
                    console.log(res)
                } else {
                    console.log(res)
                    document?.getElementById('form-control')?.classList?.add('is-invalid')
                    submitButton.removeAttribute('disabled')
                    inputField.removeAttribute('disabled')
                    inputField.value = ""
                    spanSpinner.classList.remove('spinner-border', 'spinner-border-sm')
                }
            }).catch(err => {
                console.log(err)
            })
        }
    })
}
// otp login

// method="post" action="
function userLogin() {
    const username = document?.getElementById('username')?.value;
    const password = document?.getElementById('password')?.value;
    fetch("/user/login", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            password
        }),
    }).then(res => res.json()).then(res => {
        if (res.ok) {
            otp()
        } else {
            if (res.msg == 'user not found') {
                usernameErr.innerText = 'user not found'
            }
            if (res.msg == 'password not match') {
                passwordErr.innerText = 'password not match'
            }
            console.log(res);
        }
    }).catch(err => {
        console.log(err);
    })
}
function adminLogin() {
    const username = document?.getElementById('username')?.value;
    const password = document?.getElementById('password')?.value;
    fetch("/admin/admin_login", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            password
        }),
    }).then(res => res.json()).then(res => {
        const a = document.createElement('a')
        a.setAttribute('href', '/admin')
        a.click()
    }).catch(err => err.json()).then(err => {
        console.log(err);
    })
}
function userSignup() {
    const username = document?.getElementById('username')?.value;
    const password = document?.getElementById('password')?.value;
    const cunfirmPassword = document?.getElementById('cunfirm-password')?.value;
    const email = document?.getElementById('email')?.value;
    const mobile = document?.getElementById('phone')?.value;
    let data = {
        username,
        password,
        phone: mobile,
        email,
        cunfirmPassword
    };
    fetch('/user/registration', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(res => res.json()).then(res => {
        console.log(res);
        if (!res.ok) {
            setWarning(res)
        } else {
            console.log(res);
            const a = document.createElement('a')
            a.setAttribute('href', '/user/otpLogin')
            a.click()
        }
    }).catch(err => {
        console.log(err);
    })
}



function setWarning(warn) {

    console.log(warn);
    if (warn.msg == 'user alresdy exists') {
        usernameErr.innerText = warn.msg
    } else if (warn.msg == 'email alresdy exists') {
        emailErr.innerText = warn.msg
    } else if (warn.msg == 'this phone number alresdy exists') {
        phoneErr.innerText = warn.msg
    } else { }
    setTimeout(() => {
        usernameErr.innerText = ''
        emailErr.innerText = ''
        phoneErr.innerText = ''
    }, 10000)
}


///////////////////////// FIELD VALIDATION /////////////////////////


function validateUserName() {
    var userNameErr = document.getElementById('usernameErr');
    var userName = document.getElementById('username').value;

    if (userName.length == 0) {
        userNameErr.innerHTML = 'UserName is required';
        setTimeout(() => {
            userNameErr.innerText = '';
        }, 4000);
        return false;
    }

    userNameErr.innerHTML = ""
    return true
}

function validatePhoneNumber() {
    var phoneErr = document.getElementById('phoneErr');
    var phone = document.getElementById('phone').value;
    if (phone == /^[0-9]$/) {
        phoneErr.innerText == 'enter a valid phone number'
        setTimeout(() => {
            phoneErr.innerText = '';
        }, 4000);
        return false;
    }
    if (phone.length == 0) {
        phoneErr.innerHTML = 'phone number is required';
        setTimeout(() => {
            phoneErr.innerText = '';
        }, 4000);
        return false;
    }

    phoneErr.innerHTML = ""
    return true
}


function validatePassword() {
    var passwordErr = document.getElementById('passwordErr');
    var password = document.getElementById('password').value;

    if (password.length == 0) {
        passwordErr.innerHTML = 'password is required';
        setTimeout(() => {
            passwordErr.innerText = '';
        }, 4000);
        return false;
    }

    passwordErr.innerText = ''
    return true
}




function validateCunfirnPassword() {
    var passwordErr = document?.getElementById('cunfirmPasswordErr');
    var cunfirmPassword = document?.getElementById('cunfirm-password').value;
    var password = document.getElementById('password').value;

    if (cunfirmPassword.length == 0) {
        passwordErr.innerHTML = 'password is required';
        setTimeout(() => {
            passwordErr.innerText = '';
        }, 4000);
        return false;
    }
    if (cunfirmPassword != password) {
        passwordErr.innerHTML = 'password not matching';
        setTimeout(() => {
            passwordErr.innerText = '';
        }, 4000);
        return false;
    }

    passwordErr.innerText = ''
    return true
}

function validateEmail() {
    var emailErr = document.getElementById('emailErr');
    var email = document.getElementById('email').value;

    if (email.length == 0) {
        emailErr.innerHTML = 'Email is required';
        setTimeout(() => {
            emailErr.innerHTML = '';
        }, 4000)
        return false;
    }

    if (!email.match(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)) {
        emailErr.innerHTML = 'Enter a valid email';
        return false;
    }
    emailErr.innerHTML = ""
    return true
}


function validateLoginForm(e) {
    if (validateUserName() && validatePassword()) {
        submit(e)
    }
    return false;
}


function validateSignupForm(e) {
    if (validateUserName() && validateEmail() && validatePassword() && validateCunfirnPassword() && validatePhoneNumber()) {
        submit(e)
    }
    return false;
}

function submit(e) {
    e.preventDefault()
    const userClick = e.target.getAttribute('id')
    if (userClick == 'userLogin') {
        console.log(e);
        userLogin()
    } else if (userClick == 'userSignup') {
        userSignup()
    } else if (userClick == 'adminLogin') {
        adminLogin()
    }
}
///////////////////////// FIELD VALIDATION /////////////////////////
