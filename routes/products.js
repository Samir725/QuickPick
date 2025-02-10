const express = require("express");
const router = express.Router();
const multer = require("multer");
const Product = require("../models/product.js");
const Cart = require("../models/cart.js");
const User = require("../models/user.js");
const Order = require("../models/order.js");
const { isLoggedIn } = require("../middleware.js")

// Configure multer for profile image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });


//Root route
router.get("", async (req, res) => {
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

// Checkout route
router.post("/cart/checkout", isLoggedIn,  async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
        req.flash("error", "Your cart is empty!");
        return res.redirect("/cart");
    }

    const order = new Order({
        user: req.user._id,
        items: cart.items,
        totalPrice: cart.totalPrice
    });

    await order.save();
    await Cart.deleteOne({ user: req.user._id });

    req.flash("success", "Checkout successful!");
    res.redirect("/orders");
});

// Buy Now route
router.post("/products/:id/buy", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        req.flash("error", "Product not found!");
        return res.redirect("/products");
    }

    const order = new Order({
        user: req.user._id,
        items: [{ product: product._id, quantity: 1 }],
        totalPrice: product.price
    });

    await order.save();
    req.flash("success", "Purchase successful!");
    res.redirect("/orders");
});

// Profile route
router.get("/profile", isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id).populate("cart");
    res.render("users/profile.ejs", { user });
});

// Show profile form route
router.get("/profile/update", isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("users/profileUpdate.ejs", { user });
});

// Show address form route
router.get('/profile/address', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render('users/address.ejs', { user });
});

// Update profile image route
router.post("/profile/image", isLoggedIn, upload.single('profileImage'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.profileImage = '/uploads/' + req.file.filename;
        await user.save();
        req.flash("success", "Profile image updated successfully!");
        res.redirect("/profile");
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update profile image. Please try again.");
        res.redirect("/profile");
    }
});

// Update Profile route
router.post("/profile", isLoggedIn, async (req, res) => {
    const { username, email, address } = req.body;
    const user = await User.findById(req.user._id);

    user.username = username;
    user.email = email;
    user.address = address;

    await user.save();
    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
});

// Update address route
router.post('/profile/address', isLoggedIn, async (req, res) => {
    const { street, city, state, country } = req.body;
    await User.findByIdAndUpdate(req.user._id, { address: { street, city, state, country } });
    req.flash('success', 'Address updated successfully!');
    res.redirect('/profile');
});

// About route
router.get("/about", (req, res) => {
    res.render("products/about.ejs");
});

// Contact route
router.get("/contact", (req, res) => {
    res.render("products/contact.ejs");
});

router.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;
    req.flash('success', 'Your message has been sent successfully!');
    res.redirect('/contact');
});

module.exports = router;