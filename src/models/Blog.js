import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  publishedAt: {
    type: Date,
  },
  state: {
    type: String,
    default: "draft",
  },
  user_id: {
    type: mongoose.Schema.Types.String,
    ref: "users",
  },
  read_count: {
    type: Number,
    required: true,
    default: 0,
  },
  reading_time: {
    type: Number,
  },
  body: {
    type: String,
    required: false,
  },
});

blogSchema.pre("save", (next) => {
  this.updatedAt = new Date();
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
