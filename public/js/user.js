const addToWishlistFromAllProductView = document?.getElementById('add-to-wishlist')
const addToCartFromAllProductView = document?.getElementById('add-to-cart')
const alertBox = document.getElementById('alert-box')
const alertText = document.getElementById('alert-text')


function addToWishlist(e) {
    console.log(e.target);
    e.target.style.margin = "-50px -50px"
    alertText.innerText = "successfully added to the wishlist"
    alertBox.style.opacity = "1"
    alertBox.style.transform = "scale(1.5)"
    setTimeout(() => {
        alertBox.style.transform = "scale(0.5)"
        alertBox.style.opacity = "0"

    }, 1000)
}

function addToCart(e) {
    e.target.style.margin = "-50px 260px"

    alertText.innerText = "successfully added to the cart"
    alertBox.style.opacity = "1"
    // alertBox.style.zIndex = "10"
    alertBox.style.transform = "scale(1.5)"
    setTimeout(() => {
        // alertBox.style.zIndex = "-1"
        alertBox.style.transform = "scale(0.5)"
        alertBox.style.opacity = "0"
    }, 1000)
}