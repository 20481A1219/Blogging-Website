require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookiePaser = require("cookie-parser");

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;
// const PORT=8000;

mongoose
  .connect(process.env.MONGO_URL)
  .then((e) => console.log("MongoDB Connected"));

// mongoose.connect("mongodb://127.0.0.1:27017/blogify")
// .then(()=>console.log("connected"))
// .catch((e)=>console.log("error",e))

mongoose.set('strictQuery', true);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookiePaser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.post("/search", async (req, res)=>{
  const {search} = req.body;
  const regex = new RegExp(search, 'i');
  const allSearchBlogs = await Blog.find({ $or: [
    { title: { $regex: regex } },
    { body: { $regex: regex } },
  ],})
  res.render("home", {
    user: req.user,
    blogs: allSearchBlogs,
  });
})

app.get('/category/:categoryName', async (req, res) => {
  const categoryName = req.params.categoryName;
  const regex = new RegExp(categoryName, 'i');
  const allSearchBlogs = await Blog.find({ $or: [
    { title: { $regex: regex } },
    { body: { $regex: regex } },
  ],})
  res.render("home", {
    user: req.user,
    blogs: allSearchBlogs,
  });
  
});


app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));