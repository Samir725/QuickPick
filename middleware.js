// Admin login functionality
module.exports.isAdminLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== 'admin') {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in as an admin to access this page.');
        return res.redirect('/admin/login');
    }
    next();
};

// User is logged in functionality, but not admin
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in as a user to access this page.");
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}