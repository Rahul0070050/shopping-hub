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



function addToCart(id) {
    fetch('/user/add_to_cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
    }).then(res => res.json()).then(res => {
        console.log(res)
        if(!res.ok) {
            // document.getElementById("cart-count").innerText
            swal("product already added to the cart");
        } else {
            let cartCount = Number(document?.getElementById("cart-count").innerHTML)
            document.getElementById("cart-count").innerText = cartCount + 1
            // document?.getElementById("cart-count").innerText = 1
        }
    })
}