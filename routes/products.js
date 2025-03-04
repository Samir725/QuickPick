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
    res.redirect("/products");
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

// Address selection route
router.get("/select-address", isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("products/selectAddress.ejs", { user });
});


router.post("/submit-order", isLoggedIn, async (req, res) => {
    const address = JSON.parse(req.body.address);

    if (req.session.cartCheckout) {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            req.flash("error", "Your cart is empty!");
            return res.redirect("/cart");
        }

        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            productSnapshot: {
                title: item.product.title,
                price: item.product.price,
                description: item.product.description,
                image: item.product.image
            },
            quantity: item.quantity
        }));

        const order = new Order({
            user: req.user._id,
            items: orderItems,
            totalPrice: cart.totalPrice,
            deliveryAddress: address
        });

        await order.save();
        await Cart.deleteOne({ user: req.user._id });

        req.flash("success", "Checkout successful!");
        req.session.cartCheckout = null;
        res.redirect("/orders");
    } else if (req.session.buyNowProduct) {
        const product = req.session.buyNowProduct;

        const orderItems = [{
            product: product._id,
            productSnapshot: {
                title: product.title,
                price: product.price,
                description: product.description,
                image: product.image
            },
            quantity: 1
        }];

        const order = new Order({
            user: req.user._id,
            items: orderItems,
            totalPrice: product.price,
            deliveryAddress: address
        });

        await order.save();
        req.flash("success", "Purchase successful!");
        req.session.buyNowProduct = null;
        res.redirect("/orders");
    } else {
        req.flash("error", "Invalid order request.");
        res.redirect("/products");
    }
});

// Checkout route
router.post("/cart/checkout", isLoggedIn,  async (req, res) => {
    // const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    // if (!cart) {
    //     req.flash("error", "Your cart is empty!");
    //     return res.redirect("/cart");
    // }

    // const orderItems = cart.items.map(item => ({
    //     product: item.product._id,
    //     productSnapshot: {
    //         title: item.product.title,
    //         price: item.product.price,
    //         description: item.product.description,
    //         image: item.product.image
    //     },
    //     quantity: item.quantity
    // }));

    // const order = new Order({
    //     user: req.user._id,
    //     items: orderItems,
    //     totalPrice: cart.totalPrice,
    //     deliveryAddress: req.body.deliveryAddress // Assuming delivery address is provided in the request body
    // });

    // await order.save();
    // await Cart.deleteOne({ user: req.user._id });

    // req.flash("success", "Checkout successful!");
    // res.redirect("/orders");

    req.session.cartCheckout = true;
    res.redirect("/select-address");
});

// Buy Now route
router.post("/products/:id/buy", isLoggedIn, async (req, res) => {
    // const { id } = req.params;
    // const product = await Product.findById(id);
    // if (!product) {
    //     req.flash("error", "Product not found!");
    //     return res.redirect("/products");
    // }

    // const orderItems = [{
    //     product: product._id,
    //     productSnapshot: {
    //         title: product.title,
    //         price: product.price,
    //         description: product.description,
    //         image: product.image
    //     },
    //     quantity: 1
    // }];

    // const order = new Order({
    //     user: req.user._id,
    //     items: orderItems,
    //     totalPrice: product.price,
    //     deliveryAddress: req.body.deliveryAddress // Assuming delivery address is provided in the request body
    // });

    // await order.save();
    // req.flash("success", "Purchase successful!");
    // res.redirect("/orders");

    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        req.flash("error", "Product not found!");
        return res.redirect("/products");
    }
    req.session.buyNowProduct = product;
    res.redirect("/select-address");
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

// Show new address form route
router.get('/profile/address/new', isLoggedIn, (req, res) => {
    res.render('users/newAddress.ejs');
});

// Show update address form route
router.get('/profile/address/:id/update', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(id);
    res.render('users/updateAddress.ejs', { address });
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
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    user.username = username;
    user.email = email;

    await user.save();
    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
});

// Add new address route
router.post('/profile/address', isLoggedIn, async (req, res) => {
    const { street, city, state, country } = req.body;
    const user = await User.findById(req.user._id);
    user.addresses.push({ street, city, state, country });
    await user.save();
    req.flash('success', 'Address added successfully!');
    res.redirect('/profile');
});

// Delete address route
router.post('/profile/address/:id/delete', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndUpdate(req.user._id, { $pull: { addresses: { _id: id } } });
    req.flash('success', 'Address deleted successfully!');
    res.redirect('/profile');
});

// Update address route
router.put('/profile/address/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { street, city, state, country } = req.body;
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(id);

    address.street = street;
    address.city = city;
    address.state = state;
    address.country = country;
    await user.save();
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