const express = require("express")
const router = express.Router()
const {payment,callback_url} = require("../controllers/paymentController")
const {checkUser} = require("../middlewares/checkUser")


router.post("/payment", checkUser, payment)
router.get("/callback", checkUser, callback_url)



module.exports = router