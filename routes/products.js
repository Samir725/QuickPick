const express = require("express");
const router = express.Router();
const Product = require("../models/product.js");
const Cart = require("../models/cart.js");
const User = require("../models/user.js");
const { isLoggedIn } = require("../middleware.js")


//Root route
router.get("/", async (req, res) => {
    const allProducts = await Product.find({});
    res.render("products/home.ejs", {allProducts});
});

//Index route
router.get("/products", async (req, res) => {
    const allProducts = await Product.find({});
    res.render("products/index.ejs", {allProducts});
});

//Show route
router.get("/products/:id", async (req, res) => {
    const allProducts = await Product.find({});
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render("products/show.ejs", { product, allProducts });
});

//View Cart route
router.get("/cart", isLoggedIn, async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.render("products/cart.ejs", { cart });
});

//Add to Cart route
router.post("/cart/add/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = new Cart({ user: req.user._id });
    }

    const existingItemIndex = cart.items.findIndex(item => item.product.equals(product._id));
    if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += 1;
    } else {
        cart.items.push({ product: product._id, quantity: 1 });
    }

    cart.totalPrice += product.price;
    await cart.save();

    req.flash("success", "Product added to cart!");
    res.redirect("/cart");
});

// Update Cart Item Quantity route
router.post("/cart/update/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    const itemIndex = cart.items.findIndex(item => item._id.equals(id));
    if (itemIndex >= 0) {
        if (action === "increment") {
            cart.items[itemIndex].quantity += 1;
            cart.totalPrice += cart.items[itemIndex].product.price;
        } else if (action === "decrement" && cart.items[itemIndex].quantity > 1) {
            cart.items[itemIndex].quantity -= 1;
            cart.totalPrice -= cart.items[itemIndex].product.price;
        }
    }

    await cart.save();
    res.redirect("/cart");
});

// Delete Cart Item route
router.post("/cart/delete/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    const itemIndex = cart.items.findIndex(item => item._id.equals(id));
    if (itemIndex >= 0) {
        cart.totalPrice -= cart.items[itemIndex].product.price * cart.items[itemIndex].quantity;
        cart.items.splice(itemIndex, 1);
    }

    await cart.save();
    res.redirect("/cart");
});

// // Checkout route
// router.get("/checkout", isLoggedIn, async (req, res) => {
//     const cart = await Cart.findOne({}).populate("items.product");
//     res.render("products/checkout.ejs", { cart });
// });

// Checkout route
router.post("/cart/checkout", isLoggedIn,  async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        req.flash("error", "Your cart is empty!");
        return res.redirect("/cart");
    }

    await Cart.deleteOne({ user: req.user._id });

    req.flash("success", "Checkout successful!");
    res.redirect("/products");
})

module.exports = router;