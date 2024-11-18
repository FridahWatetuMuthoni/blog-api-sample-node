import { Router } from "express";
import { authenticateUser } from "../middlewares/auth";
import {
  createBlog,
  getAllBlogs,
  getOneBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog";

const blogRouter = Router();

blogRouter.use(authenticateUser);

blogRouter.post("/api/blog", createBlog);
blogRouter.get("/api/blog", getAllBlogs);
blogRouter.get("/api/blog/:id", getOneBlog);
blogRouter.put("/api/blog/update/:id", updateBlog);
blogRouter.delete("/api/blog/delete/:id", deleteBlog);

export default blogRouter;
