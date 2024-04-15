const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser")
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const mongoose = require("mongoose");
const expressFileupload = require("express-fileupload")

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Database connection established")
}).catch((err)=>{
    console.log(err.message)
})

app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayouts: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "hbs");


app.use(expressFileupload())
app.use(cookieParser())
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", userRoutes);
app.use("/", paymentRoutes);

app.get("*", (req, res) => {
  res.send(
    "<div style='height:100vh; display:flex; justify-content:center; align-items:center; font-size:30px;'><h1>Page Not Found</h1></div>"
  );
});


const port = process.env.PORT;
app.listen(port, () => {
  console.log("listening on port " + port);
});
