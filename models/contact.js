const mongoose = require("mongoose")

const contactSchema = new mongoose.Schema({
    firstName:{
        type: String
    },
    lastName:{
        type: String
    },
    email:{
        type: String,
    },
    subject:{
        type: String
    },
    message:{
        type: String
    },
    date:{
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Contact", contactSchema)