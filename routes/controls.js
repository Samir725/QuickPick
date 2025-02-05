const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { isAdminLoggedIn } = require('../middleware.js');
const Product = require("../models/product.js");
const Admin = require("../models/admin.js")
const User = require("../models/user.js");
const Order = require("../models/order.js");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Directory where images are saved
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage });


//Admin route
router.get("", isAdminLoggedIn, async (req, res) => {
    const allProducts = await Product.find({});
    res.render("admin/products/dashboard.ejs", { allProducts });
});

//Admin Add Products route
router.get("/addproducts", isAdminLoggedIn, (req, res) => {
    res.render("admin/products/addProducts.ejs");
});

router.post('/products', isAdminLoggedIn, upload.single('image'), async (req, res) => {
    const { title, price, size, description } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "/assets/s-l1600 1.png"; // Use uploaded image or default
    const newProduct = new Product({ title, image: imagePath, price, size, description });
    await newProduct.save();
    req.flash('success', 'Product added successfully!');
    res.redirect('/admin/addproducts');
});

//Admin Delete Products route
router.get("/deleteproducts", isAdminLoggedIn, async (req, res) => {
    const allProducts = await Product.find({});
    res.render("admin/products/deleteProducts.ejs", { allProducts });
});

router.delete('/products/:id', isAdminLoggedIn, async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    req.flash('success', 'Product deleted successfully!');
    res.redirect('/admin/deleteproducts');
});

//Admin Edit Products route
router.get('/editProducts/:id/edit', isAdminLoggedIn, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('admin/products/edit.ejs', { product });
});

router.put('/editProducts/:id', isAdminLoggedIn, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, price, size, description } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.existingImage; // Use uploaded image or default
    await Product.findByIdAndUpdate(id, { title, image: imagePath, price, size, description });
    req.flash('success', 'Product updated successfully!');
    res.redirect('/admin/deleteproducts');
});

//Admin Users route
router.get("/users", isAdminLoggedIn, async (req, res) => {
    const adminUsers = await Admin.find({});
    const users = await User.find({});
    res.render("admin/products/users.ejs", { adminUsers, users });
});

router.delete('/users/:id', isAdminLoggedIn, async (req, res) => {
    const { id } = req.params;
    await Admin.findByIdAndDelete(id);
    await User.findByIdAndDelete(id);
    req.flash('success', 'Product deleted successfully!');
    res.redirect('/admin/users');
});

// View Orders route for admin
router.get('/orders', isAdminLoggedIn, async (req, res) => {
    const allProducts = await Product.find({});
    const orders = await Order.find({}).populate('items.product').populate('user');
    res.render('admin/products/orders.ejs', { orders, allProducts });
});

// Update Order Status route
router.post('/orders/:id', isAdminLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    await Order.findByIdAndUpdate(id, { status });
    req.flash('success', 'Order status updated successfully!');
    res.redirect('/admin/orders');
});

module.exports = router;