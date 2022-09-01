const username = document?.getElementById('username')?.value;
const password = document?.getElementById('password')?.value;
const cunfirmPassword = document?.getElementById('cunfirm-password')?.value;
const email = document?.getElementById('email')?.value;
const mobile = document?.getElementById('phone')?.value;

let usernameErr = document?.getElementById('usernameErr')
let passwordErr = document?.getElementById('passwordErr')
let emailErr = document?.getElementById('emailErr')
let cunfirmPasswordErr = document?.getElementById('cunfirmPasswordErr')
let phoneErr = document?.getElementById('phoneErr')

function submit(e) {
    e.preventDefault()
    const userClick = e.target.getAttribute('id')
    if (userClick == 'userLogin') {
        console.log(e);
        userLogin()
    } else if (userClick == 'userSignup') {
        userSignup()
    } else if(userClick == 'adminLogin') {
        adminLogin()
    }
}
// method="post" action="
function userLogin() {
    fetch("/user/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            password
        })
    }).then(res => res.json()).then(res => {
        console.log(res);
        const a = document.createElement('a')
        a.setAttribute('href','/')
        a.click()
    }).catch(err => {
        console.log(err);
    })
}
function adminLogin() {
    fetch("/user/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            password
        })
    }).then(res => res.json()).then(res => {
        console.log(res);
    }).catch(err => err.json()).then(err => {
        console.log(err);
    })
}
function userSignup() {
    let data = {
        username,
        password,
        phone: mobile,
        email
    };
    fetch('/user/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(res => {
        console.log(res);
        if(!res.ok) {
            setWarning(res.msg)
        }
    }).catch(err => {
        console.log(err);
    })
}
function validateUsername(e) {
    // const userName = e.target.value;
    return
}

function setWarning(text) {
    console.log(text == 'username');
    if ('username' == text) {
        console.log(usernameErr);
        usernameErr.innerHTML = `${text} already taken`
    } else if ('email' == text) {
        emailErr.innerText = `${text} already taken`
    } else if ('phone' == text) {
        phoneErr.innerText = `${text} already taken`
    } else { }
    setTimeout(() => {
        usernameErr = ''
        emailErr = ''
        phoneErr = ''
    },4000)
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
    var passwordErr = document.getElementById('cunfirmPasswordErr');
    var cunfirmPassword = document.getElementById('confirm-password').value;
    var password = document.getElementById('password').value;

    if (cunfirmPassword.length == 0) {
        passwordErr.innerHTML = 'password is required';
        setTimeout(() => {
            passwordErr.innerText = '';
        }, 4000);
        return false;
    }
    if(cunfirmPassword != password) {
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
///////////////////////// FIELD VALIDATION /////////////////////////
