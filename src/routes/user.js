import { Router } from "express";
import { createUser, login } from "../controllers/user";

const userRouter = Router();

userRouter.post("api/user/register", createUser);
userRouter.post("/api/auth/login", login);

export default userRouter;
