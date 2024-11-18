import User from "../models/User";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const createUser = async (request, response) => {
  const { first_name, last_name, email, password, country } = request.body;

  try {
    const isExisting = await User.findOne({ email });

    if (isExisting) {
      return response.status(400).json({
        success: false,
        message: "A user with that email already exist",
      });
    }

    const new_user = await User.create({
      first_name,
      last_name,
      email,
      country,
      password,
    });

    const JWT_SECRET = process.env.JWT_SECRET;

    const token = await jsonwebtoken.sign(
      {
        first_name: new_user.first_name,
        email: new_user.email,
        _id: User._id,
      },
      JWT_SECRET
    );

    response
      .status(302)
      .json({ success: true, message: "user created successfully" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      message: "An error occured when trying to create the user",
    });
  }
};

const login = async (request, response) => {
  const { email, password } = request.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return response
        .status(404)
        .json({ success: true, message: "user not found" });
    }

    const validatePassword = await user.isValidPassword(password);

    if (!validatePassword) {
      return response
        .status(400)
        .json({ success: false, message: "invalid password" });
    }

    const token = await jsonwebtoken.sign(
      { user: user },
      process.env.JWT_SECRET,
      {
        expireIn: "1h",
      }
    );

    response.cookie(
      "token",
      token,
      { httpOnly: true },
      { maxAge: 60 * 60 * 1000 }
    );
    response.status(200).json({ success: true, message: "successfly login" });
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({ success: true, message: "server error" });
  }
};

export { createUser, login };
