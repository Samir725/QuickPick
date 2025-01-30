const express = require("express");
const router = express.Router();
const passport = require("passport");
const Admin = require("../models/admin");
const { isAdminLoggedIn, saveRedirectUrl } = require('../middleware.js');

// Admin registration route
router.get("/signup", isAdminLoggedIn, (req, res) => {
    res.render("admin/adminauth/signup.ejs");
});

router.post("/signup", isAdminLoggedIn, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const admin = new Admin({ username, email });
        const registeredAdmin = await Admin.register(admin, password);
        req.login(registeredAdmin, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to QuickPick Admin Dashboard!");
            res.redirect("/admin");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/admin/signup");
    }
});

// Admin login route
router.get("/login", (req, res) => {
    res.render("admin/adminauth/login.ejs");
});

router.post("/login", saveRedirectUrl, passport.authenticate("admin-local", {
    failureFlash: true,
    failureRedirect: "/admin/login"
}), (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/admin";
    res.redirect(redirectUrl);
});

// Admin logout route
router.get("/logout", (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash("success", "Goodbye!");
        res.redirect("/admin/login");
    });
});

module.exports = router;