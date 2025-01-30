const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require('method-override');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Admin = require("./models/admin.js");
const User = require("./models/user.js");

const productRouter = require("./routes/products.js");
const controlRouter = require("./routes/controls.js");
const adminRouter = require("./routes/admin.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/quickpick";

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.engine("ejs", ejsMate);
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "/public")));
app.use('/uploads', express.static('uploads'));
app.use(methodOverride('_method'));

const sessionOptions = {
    secret: "thisisnotagoodsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use('admin-local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, Admin.authenticate()));

passport.use('user-local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, User.authenticate()));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    if (user != null)
        done(null, user);
});

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

app.use("/", productRouter);
app.use("/admin", controlRouter);
app.use("/admin", adminRouter);
app.use("/", userRouter);

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
});