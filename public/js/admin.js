const toggleBtn = document?.getElementById('toggle');
const toggleSwitch = document?.getElementById('switch');
const tBody = document?.getElementById('tbody');
const mainImage = document.getElementById('select-main-image');

toggleBtn?.addEventListener('click',() => {
    toggleSwitch.classList.toggle('btn-clicked')
})

tBody?.addEventListener('click',(e) => {
    // user_id
    const atr = e.target.getAttribute('user_id');
    const a = document.createElement('a');
    a.setAttribute('href','/admin/admin_panel/user/'+atr)
    a.click()
    console.log(atr);
})

function showUser(id) {
    alert(id)
    // let a = document.createElement('a')
    // a.setAttribute('href','admin_panel/user/id')
    // a.click()
}