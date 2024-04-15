const userModel = require("../models/userModel");
const cartModel = require("../models/cart");
const checkoutModel = require("../models/checkoutModel");
// const { validcheckoutform } = require("../middlewares/validate");
const axios = require("axios");
const { redirect } = require("express/lib/response");

const payment = async (req, res) => {
  try {
    if (req.user) {
      //grabbing the current user Id
      const userId = req.user.id;

      //fetching the current user account
      const currentUser = await userModel.findOne({ _id: userId });

      //fetching the current user carts
      const userCart = await cartModel
        .find({ userId: userId })
        .populate("productId");

      //trying to calculate thr total amount of products in the cars
      let totalAmount = 0;
      //looping therough the carts to calculate the total price of allthe products
      await userCart.forEach((item) => {
        totalAmount = totalAmount + item.productId.price * item.quantity;
      });

      const {
        country,
        firstName,
        lastName,
        streetAddress,
        postcode,
        city,
        phone,
      } = req.body;

      const headers = {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      };

      const transactionData = {
        email: currentUser.email,
        userId: currentUser._id,
        currency: "NGN",
        country: country,
        address: streetAddress,
        phoneNumber: phone,
        city: city,
        postcode: postcode,
        firstName: firstName,
        lastName: lastName,
        amount: totalAmount * 100,
        callback_url: "http://localhost:5450/callback",
      };

      const createTransaction = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        transactionData,
        { headers }
      );

      const {
        data: { authorization_url },
      } = createTransaction.data;

      res.redirect(authorization_url);

      //   console.log(totalAmount);

      //   const { error } = validcheckoutform(req.body);
      //   if (error) {
      //     return res.render("check-out", {
      //       error: error.details[0].message,
      //       userCart,
      //       currentUser,
      //     });
      //   }
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
    res.redirect("/checkout");
  }
};



const callback_url = async (req, res) => {
  const userId = req.user.id;
  const currentUser = await userModel.findOne({ _id: userId });
  const cart = await cartModel.find({ userId: userId }).populate("productId");
  //trying to calculate thr total amount of products in the cars
  let totalAmount = 0;
  //looping therough the carts to calculate the total price of allthe products
  await cart.forEach((item) => {
    totalAmount = totalAmount + item.productId.price * item.quantity;
  });

  try {
    const { reference, trxref } = req.query;

    const status = await verifyPayment(trxref);

    if (status) {
      //mapping through the cart product to fetch the productId and the quantity of each cart items
      const products = await cart.map((item) => {
        return { productId: item.productId._id, quantity: item.quantity };
      });

      await checkoutModel.create({
        userId: userId,
        product: products,
        reference: reference,
        trxref: trxref,
        success: true,
      });

      await cartModel.deleteMany({ userId: userId });
      res.render("check-out", {
        success: "Product  Checked out successfully",
        currentUser,
      });
    } else {
      await checkoutModel.create({
        userId: userId,
        product: products,
        reference: reference || "",
        trxref: trxref,
        success: false,
      });
      res.render("check-out", {
        error: "Payment failed",
        currentUser,
        userCart: cart,
        totalAmount
      });
    }
  } catch (err) {
    console.log(err);
    res.render("check-out", {
        error: "Product Checked out failed",
        currentUser,
        userCart: cart,
        totalAmount
      });
  }
};

async function verifyPayment(trxref) {
  try {
    const verifyUrl = `https://api.paystack.co/transaction/verify/${trxref}`;

    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    if (
      response.data &&
      response.data.status &&
      response.data.data.status === "success"
    ) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = { payment, callback_url };
