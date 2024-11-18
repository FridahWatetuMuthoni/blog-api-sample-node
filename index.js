import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import router from "./src/routes/index.js";
import { logger } from "./src/config/logger.js";
import winston from "winston";
import Blog from "./src/models/Blog.js";
import User from "./src/models/User.js";

const app = express();

//env config
dotenv.config();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use(router);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/publishedblogs", async (req, res) => {
  try {
    // Fetch published blogs from your database ( 'state' represents the publish state)
    const publishedBlogs = await Blog.find({ state: "published" });

    res.render("publishedBlogs", { blogs: publishedBlogs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/blog/:_id", async (req, res) => {
  try {
    const blogId = req.params._id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Increment the read_count by 1
    blog.read_count = parseInt(blog.read_count) + 1;
    await blog.save();

    // Fetch the user information
    const user_id = blog.user_id; // the user_id is stored in the blog document
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.render("blog", {
      user_id: user_id,
      user: user,
      blog: blog,
      date: new Date(),
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/allblogs", async (req, res) => {
  try {
    const user_id = req.query.user_id; // req.query to get user_id

    // Get search parameters from the query
    const searchAuthor = req.query.author;
    const searchTitle = req.query.title;
    const searchTags = req.query.tags;

    // Get ordering parameters from the query
    const orderField = req.query.orderField;
    const orderDirection = req.query.orderDirection;

    const totalBlogs = await Blog.countDocuments();
    const users = await User.find({ user_id });

    // Get page and limit from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3; // Set  default limit

    const totalPages = Math.ceil(totalBlogs / limit);

    if (page < 1) {
      page = 1;
    } else if (page > totalPages) {
      page = totalPages;
    }

    // Calculate the skip value
    const skip = (page - 1) * limit;

    // Create a query object to filter blogs
    const query = {};

    //  conditions for author, title, and tags if provided
    if (searchAuthor) {
      query.author = searchAuthor;
    }
    if (searchTitle) {
      query.title = searchTitle;
    }
    if (searchTags) {
      query.tags = { $in: searchTags.split(",") };
    }

    // Create an order object for sorting
    const sort = {};

    if (orderField && (orderDirection === "asc" || orderDirection === "desc")) {
      sort[orderField] = orderDirection;
    }

    // Fetch blogs based on pagination, search conditions, and sorting
    const blogs = await Blog.find(query)

      .skip(skip)
      .limit(limit)
      .sort(sort);

    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      blog.read_count += 1;

      if (blog.body) {
        console.log(`Blog ${i} body:`, blog.body);

        const words = blog.body.split(" ");
        const reading_time = Math.ceil(words.length / 200);
        blog.reading_time = reading_time;
      }

      await blog.save();
    }

    res.status(200).render("allblogs", {
      user_id: user_id,
      users: users,
      page: page,
      totalPages: totalPages,
      totalBlogs: totalBlogs,
      limit: limit,
      blogs: blogs,
      date: new Date(),
    });
  } catch (err) {
    return res.json(err);
  }
});

app.get("/dashboard", auth.authenticateUser, async (req, res) => {
  try {
    const user_id = req.user_id;
    const user = req.user;

    const blogs = await Blog.find({ user_id: user_id });

    // const users = await userModel.find({req.body.first_name })
    // console.log(blogs)
    res
      .status(200)
      .render("dashboard", { user_id, user, blogs, date: new Date() });
  } catch (err) {
    return res.json(err);
  }
});

// app.get('/users/dashboard.css', (req, res) => {
//     res.type('text/css'); // Set the content type to CSS
//     res.sendFile(path.join(__dirname, 'public/dashboard.css'));
// });

app.get("/update/:_id", async (req, res) => {
  try {
    // Retrieve the blog post by ID
    const postId = req.params._id;
    const blog = await Blog.findById(postId);

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Render the updateBlog.ejs template with the blog post data
    res.render("updateblog", { blog });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/create", (req, res) => {
  res.render("createblog");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/existinguser", (req, res) => {
  res.render("existinguser");
});

app.get("/invalidinfo", (req, res) => {
  res.render("invalidinfo");
});

app.get("/unknown", (req, res) => {
  res.render("unknown");
});

app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} ${req.ip}`);
  next();
});

// Error Handling
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} ${req.ip}`);
  next();
});

app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );
  // Handle errors and send a response
  res.status(err.status || 500).send(err.message || "Internal Server Error");
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Web server is running on: http://localhost:${PORT}`);
});
