const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Order = require("../models/order.js");
const { saveRedirectUrl, isLoggedIn } = require("../middleware");

//User registration route
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", saveRedirectUrl, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to QuickPick!");
            let redirectUrl = res.locals.redirectUrl || "/";
            res.redirect(redirectUrl);
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});

//User login route
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", saveRedirectUrl, passport.authenticate("user-local", {
    failureFlash: true,
    failureRedirect: "/login",
}), (req,res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/";
    res.redirect(redirectUrl);
});

//User logout route
router.get("/logout", (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash("success", "Goodbye!");
        res.redirect("/products");
    });
});

// View Orders route for user
router.get("/orders", isLoggedIn, async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    res.render("products/orders.ejs", { orders });
});

module.exports = router;