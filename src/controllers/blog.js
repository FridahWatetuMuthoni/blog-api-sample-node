import Blog from "../models/Blog";
import User from "../models/User";

const createBlog = async (request, response) => {
  try {
    const {
      title,
      description,
      tag,
      author,
      timestamp,
      state,
      read_count,
      reading_time,
      body,
    } = request.body;

    const user_id = request.user_id;
    const existingBlog = await Blog.findOne({
      title,
      description,
      tag,
      author,
      state,
      body,
      user_id,
    });

    if (existingBlog) {
      return response
        .status(400)
        .json({ success: false, message: "The blog already exists" });
    }

    const blog = await Blog.create({
      title,
      description,
      tag,
      author,
      state,
      body,
      user_id,
    });

    response
      .status(200)
      .json({ success: true, message: "successfully created", blog });
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      success: true,
      message: "there was a problem creating the blog",
    });
  }
};

const getAllBlogs = async (request, response) => {
  try {
    const user_id = request.query.user_id;
    const totalBlogs = await Blog.countDocuments();

    //Get page and limit from query string
    let page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 20;

    const totalPages = Math.ceil(totalBlogs / limit);

    if (page < 1) {
      page = 1;
    } else if (page > totalPages) {
      page = totalPages;
    }

    //calculation of skip value
    const skip = (page - 1) * limit;

    //fetch blogs based on pagination parameters
    const blogs = await Blog.find().skip(skip).limit(limit);

    for (let i = 0; i < blogs.length; i++) {
      const blog = blog[i];
      blog.read_count = parseInt(blog.read_count) + 1;
      await blog.save();

      //checking if the blog is published and has a published date
      if (blog.state === "published" && blog.publishedAt) {
        blog.publishedDate = blog.publishedAt.toDateString();
      } else {
        blog.publishedDate = "Not published yet";
      }
    }

    const users = await Blog.find({ user_id });

    response.status(200).json({
      success: true,
      message: "success",
      data: {
        user_id,
        users,
        totalPages,
        page,
        totalBlogs,
        limit,
        blogs,
        date: new Date(),
      },
    });
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({ success: false, message: "An error occured" });
  }
};

const getOneBlog = async (request, response) => {
  try {
    const blog_id = request.params.blog_id;
    const blog = await Blog.findById(blog_id);

    if (!blog) {
      return response
        .status(404)
        .json({ success: true, message: "Blog not found" });
    }

    //incrementing the read count by one
    blog.read_count = parseInt(blog.read_count) + 1;
    await blog.save();

    //check if the blog is published and has a published date
    let publishedDate = "Not published yet";
    if (blog.state === "published" && blog.publishedAt) {
      publishedDate = blog.publishedAt.toDateString();
    }

    //fetch the user information
    const user_id = blog.user_id;
    const user = await User.findById(user_id);

    if (!user) {
      return response
        .status(404)
        .json({ success: true, message: "user not found" });
    }

    return response.status(200).json({
      success: true,
      message: "successfully retrived",
      data: { user_id, user, blog, publishedDate, date: new Date() },
    });
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({ success: true, message: "Error retriving the blog" });
  }
};

const updateBlog = async (request, response) => {
  try {
    const {
      params: { id },
      body: { title, description, tag, author, state, body },
    } = request;

    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
      return response
        .status(404)
        .json({ success: true, message: "The blog was not found" });
    }

    existingBlog.title = title || existingBlog.title;
    existingBlog.description = description || existingBlog.description;
    existingBlog.tag = tag || existingBlog.tag;
    existingBlog.author = author || existingBlog.author;
    existingBlog.state = state || existingBlog.state;
    existingBlog.body = body || existingBlog.body;

    if (state === "published" && !existingBlog.publishedAt) {
      existingBlog.publishedAt = new Date();
    }

    const updatedBlog = await existingBlog.save();

    return response.status(200).json({
      success: true,
      message: "Blog updated successfully",
      updatedBlog,
    });
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({ success: true, message: "Server error" });
  }
};

const deleteBlog = async (request, response) => {
  try {
    const {
      params: { id },
    } = request;
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return response
        .status(404)
        .json({ success: true, message: "Blog was not found" });
    }
    return response
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({ success: true, message: "server error" });
  }
};

export { createBlog, getAllBlogs, getOneBlog, updateBlog, deleteBlog };
