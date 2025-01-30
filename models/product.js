const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: { 
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "/assets/s-l1600 1.png",
        // set: (v) => v === " " ? "/assets/s-l1600 1.png" : v,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    size: String,
    description: {
        type: String,
        required: true,
    },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;