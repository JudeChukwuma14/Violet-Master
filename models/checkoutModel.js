const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],

  reference:{
    type: String
  },
  trxref:{
    type: String
  },
  success:{
    type: Boolean,
    required: true
  },

  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Checkout", checkoutSchema);
