const loginformContainer = document?.querySelector('.form-container')
const loginform = document?.querySelector('#user-login-form')
const body = document?.querySelector('body')
document?.getElementById('user-login').addEventListener('click',(e) => {
    loginformContainer.style.opacity = '1'
    loginformContainer.style.zIndex = '4'

    loginform.style.transform = "scale(1.2)"
    body.style.overflowY = 'hidden'
    setTimeout(() => {
        loginform.style.transform = "scale(1)"
    },600)
})

document?.querySelector('#close-btn').addEventListener('click',() => {
    loginformContainer.style.opacity = '0'
    loginformContainer.style.zIndex = '-1'

    loginform.style.transform  = 'scale(0.1)'
    body.style.overflowY = 'auto'
})