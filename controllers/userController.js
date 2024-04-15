const contactModel = require("../models/contact");
const cartModel = require("../models/cart");
const userModel = require("../models/userModel");
const productModel = require("../models/product");
const { uniqueName } = require("../middlewares/imageName");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const errorpage = (req, res) => {
  res.render("error", { error: "Error Occured" });
};

const getHome = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const user = await userModel.findOne({ _id: userId });
      const slicedName = user.email.split("");
      const currentUser = `${slicedName[0] + slicedName[1] + slicedName[2]}`;
      res.render("index", { currentUser });
    } else {
      res.render("index");
    }
  } catch (err) {
    console.log(err.message);
    res.render("error", { error: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const currentUser = await userModel.findOne({ _id: userId });
      res.render("categories", { currentUser });
    } else {
      res.render("categories");
    }
  } catch (err) {
    console.log(err.message);
    res.render("error", { error: err.message });
  }
};

const getContact = async (req, res) => {
  try {
    const contact = true;
    if (req.user) {
      const userId = req.user.id;
      const currentUser = await userModel.findOne({ _id: userId });
      res.render("contact", { currentUser, contact });
    } else {
      res.render("contact", { contact });
    }
  } catch (err) {
    console.log(err.message);
    res.render("error", { error: err.message });
  }
};

const getCheckout = async (req, res) => {
  try {
    if (req.user) {
      //grabbing the current user Id
      const userId = req.user.id;
      //fetching the current user account
      const currentUser = await userModel.findOne({ _id: userId });
       //fetching the current user carts
       const userCart = await cartModel.find({userId: userId}).populate("productId")

       //trying to calculate thr total amount of products in the cars
       let totalAmount = 0
       //looping therough the carts to calculate the total price of allthe products
       await userCart.forEach((item) => {
           totalAmount = totalAmount + (item.productId.price*item.quantity);
         });

        //  console.log(totalAmount);
      res.render("check-out", { currentUser, userCart, totalAmount });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
    res.render("error", { error: err.message });
  }
};

const getCart = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const currentUser = await userModel.findOne({ _id: userId });
      const allCarts = await cartModel.find({userId: userId}).populate("productId");
      let totalAmount = 0;
      if (req.query.cartId) {
        const symbol = req.query.symbol;
        const itemId = req.query.cartId;
        console.log(itemId)
    
        let cart;
        if (symbol === "minus") {
            // cart = await cartModel.findOne({ _id: itemId });
            // cart.quantity -= 1;
            // console.log(cart)
        } else {
            // cart = await cartModel.findOne({ _id: itemId });
            // cart.quantity += 1;
            // console.log(cart)
        }
    
        // await cart.save();
    }
    
      const carts = await allCarts.map((item) => {
        totalAmount += item.productId.price;
        return {
          ...item.toObject(),
          display: item.productId.images[0],
          total: item.productId.price * item.quantity,
        };
      });

      res.render("shopping-cart", { carts, totalAmount, currentUser });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
    res.render("error", { error: err.message });
  }
};

const getProducts = async (req, res) => {
  try {
    let page;
    if (req.query) {
      page = req.query.page;
    }
    let perpage = 5;

    const count = await productModel.find().countDocuments();
    let totalPages = Math.ceil(count / perpage);
    let allPages = [];
    for (let i = 1; i <= totalPages; i++) {
      allPages.push({
        pageNumber: i,
        active: page == i ? true : false,
      });
    }

    let previous = page > 1 ? Number(page) - 1 : null;
    let next = page < totalPages ? Number(page) + 1 : null;

    const products = await productModel
      .find()
      .populate("postedBy")
      .sort({ date: -1 })
      .limit(perpage)
      .skip((page - 1) * perpage);
    const allProducts = await products.map((item) => {
      return {
        ...item.toObject(),
        display: item.images[0] || "/img/products/img-1.jpg",
      };
    });
    const allCategories = products.map((item) => {
      return item.category;
    });
    const uniqueCategories = new Set(allCategories);
    const categories = Array.from(uniqueCategories);
    if (req.user) {
      const userId = req.user.id;
      const currentUser = await userModel.findOne({ _id: userId });
      res.render("products", {
        allProducts,
        categories,
        currentUser,
        page,
        totalPages,
        allPages,
        previous,
        next,
      });
    } else {
      res.render("products", {
        allProducts,
        categories,
        page,
        totalPages,
        allPages,
        previous,
        next,
      });
    }
  } catch (err) {
    console.log(err.message);
    res.render("error", { error: err.message });
  }
};

const productDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel
      .findOne({ _id: productId })
      .populate("postedBy");
    // console.log(product)
    if (req.user) {
      const userId = req.user.id;
      const currentUser = await userModel.findOne({ _id: userId });
      res.render("product-page", { product, currentUser });
    } else {
      res.render("product-page", { product });
    }
  } catch (err) {
    console.log(err);
    res.render("error", { error: err });
  }
};

const postContact = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const currentUser = await userModel.findOne({ _id: userId });
      const { firstName, lastName, email, subject, message } = req.body;

      await contactModel.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        subject: subject,
        message: message,
      });

      res.redirect("/contact");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
    res.render("error", { error: err.message });
  }
};

const getPost = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const currentUser = await userModel.findOne({ _id: userId });
      res.render("post-product", { currentUser });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
    res.render("error", { error: err.message });
  }
};

const postProduct = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    const { productName, category, price, description, tags } = req.body;
    const images = req.files.images;

    const imageArr = [];
    const fields = [];
    const incomingFields = [
      "productName",
      "category",
      "price",
      "description",
      "tags",
    ];
    for (const child of incomingFields) {
      if (!req.body[child] || req.body[child] === "") {
        fields.push(child);
      }
    }

    if (fields.length > 0) {
      return res.render("post-product", {
        error: `This field(s) ${fields.join(", ")} cannot be empty`,
      });
    }

    const tagArr = tags.split(",") || tags.split(" ");

    if (Array.isArray(images)) {
      await Promise.all(
        images.map(async (item) => {
          const newname = uniqueName(item.name);
          const filePath = `/products/${newname}`;
          imageArr.push(filePath);
          const fileDir = `public/products/${newname}`;
          await item.mv(fileDir);
        })
      );
    } else {
      const newname = await uniqueName(images.name);
      const filePath = `/products/${newname}`;
      imageArr.push(filePath);
      const fileDir = `public/products/${newname}`;
      await images.mv(fileDir);
    }

    await productModel.create({
      productName: productName,
      category: category,
      price: price,
      description: description,
      tags: tagArr,
      images: imageArr,
      postedBy: userId,
    });

    res.render("post-product", { success: "Post successful", currentUser });
  } else {
    res.redirect("/login");
  }
};

const addCart = async (req, res) => {
  if (req.user) {
    const userId = req.user.id;
    const currentUser = await userModel.findOne({ _id: userId });
    const cartId = req.params.id;
    const product = await productModel.findOne({ _id: cartId });
    await cartModel.create({
      userId: userId,
      productId: cartId,
    });
    // "shopping-cart", {success: "Added to cart successfully"}
    res.render("product-page", { product, currentUser });
  } else {
    res.redirect(`/login`);
  }
};

const getLogin = (req, res) => {
  res.render("cardlogin");
};

const createUser = async (req, res) => {
  const { email, password, confirm_password } = req.body;
  const checkField = ["email", "password", "confirm_password"];
  const emptyField = [];
  for (const field of checkField) {
    if (!req.body[field] || req.body[field] === "") {
      emptyField.push(field);
    }
  }

  if (emptyField.length > 0) {
    return res.render("cardlogin", {
      error: `This field(s) ${emptyField.join(", ")} cannot be empty`,
    });
  }

  if (password !== confirm_password) {
    return res.render("cardlogin", { error: `Passwords does not match` });
  }

  const checkEmail = await userModel.findOne({ email: email });
  if (checkEmail) {
    return res.render("cardlogin", { error: `Email already exist !` });
  }

  await userModel.create({
    email: email,
    password: password,
  });

  return res.render("cardlogin", {
    success: `Account created successfully, kindly login !`,
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const checkField = ["email", "password"];
  const emptyField = [];
  for (const field of checkField) {
    if (!req.body[field] || req.body[field] === "") {
      emptyField.push(field);
    }
  }

  if (emptyField.length > 0) {
    return res.render("cardlogin", {
      error: `This field(s) ${emptyField.join(", ")} cannot be empty`,
    });
  }

  const checkUser = await userModel.findOne({ email: email });

  if (!checkUser) {
    return res.render("cardlogin", { error: "Email does not exist" });
  }

  const comparePassword = await bcrypt.compare(password, checkUser.password);

  if (comparePassword) {
    const token = await jwt.sign(
      { id: checkUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.cookie("violet", token);

    return res.redirect("/");
  } else {
    return res.render("cardlogin", { error: "Email or Password mismatch" });
  }
};

const logout = (req, res) => {
  if (req.user) {
    res.clearCookie("violet");
    res.redirect("/login");
  } else {
    res.redirect("/login");
  }
};

module.exports = {
  logout,
  loginUser,
  createUser,
  getHome,
  addCart,
  getCart,
  getProducts,
  getContact,
  getCategories,
  getCheckout,
  postContact,
  productDetails,
  getPost,
  postProduct,
  getLogin,
  errorpage,
};
