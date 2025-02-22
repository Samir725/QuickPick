const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productSnapshot: {
        title: String,
        price: Number,
        description: String,
        image: String
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
});

const addressSchema = new Schema({
    street: String,
    city: String,
    state: String,
    country: String
});

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    deliveryAddress: addressSchema,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);