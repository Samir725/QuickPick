const { default: mongoose } = require("mongoose");

const sampleProduct = [
    {
    title: "CHANEL Mini flap bag",
    image: "/assets/s-l1600 1.png",
    price: 2000,
    size: "",
    description: "Lambskin & gold-tone metal, black",
    },
    {
    title: "Converse Shoes",
    image: "/assets/s-l1600 2.png",
    price: "3000",
    size: "32",
    description: "Chuck Taylor All Star Trek Chuck 70 Platform Shoes Ecru US 9al",
    },
    {
    title: "Essential Hoodie",
    image: "/assets/Buttercream-Essential-Hoodie-1 1.png",
    price: "1500",
    size: "xxl",
    description: "Buttercream Essential Hoodie",
    },
    {
    title: "Veleno Perfume",
    image: "/assets/Veleno_100ml_800x 1.png",
    price: "500",
    size: "small",
    description: "Veleno Perfume, 100ml",
    },
    {
    title: "Akubra Snowy River Hat",
    image: "/assets/angler-hat1649338601 1.png",
    price: "800",
    size: "medium",
    description: "Akubra snowy Hat Premium",
    },
    {
    title: "G-Shock GA-110GB-1A",
    image: "/assets/GA-110GB-1A_1 1.png",
    price: "2000",
    size: "",
    description: "G-Shock Premium Watch Analog",
    }
];

module.exports = { data: sampleProduct };