const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    productName:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        default: 0
    },
    description:{
        type: String,
        required: true
    },
    ratings:{
        type: Number,
        default: 5
    },
    tags:[{type: String}],
    quantity:{
        type: Number,
        default: 1
    },
    status:{
        type: String,
        enum:["popular", "sale", "new", ""],
        default: ""
    },
    images:[{type: String}],
    postedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    date: {
        type: Date,
        default: Date.now()
    }
})


module.exports = mongoose.model("Product", productSchema)