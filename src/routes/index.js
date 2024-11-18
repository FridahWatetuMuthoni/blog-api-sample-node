import userRouter from "./user";
import blogRouter from "./blog";
import { Router } from "express";

const router = Router();

router.use(userRouter);
router.use(blogRouter);

export default router;
