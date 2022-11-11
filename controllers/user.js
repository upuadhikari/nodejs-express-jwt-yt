import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "dotenv";
import { config, refreshConfig } from "../config/auth.config.js";
import sendConfirmationEmail from "../mail/sendConfirmationEmail.js";
import resetPasswordLink from "../mail/resetPassword.js";

const accessTokenGenerator = (existingUser) => {
  return jwt.sign(
    { email: existingUser.email, id: existingUser._id },
    config.secret,
    {
      expiresIn: "1h",
    }
  );
};

const refreshTokens = [];

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.json({ status: "not found", message: "User doesn't exists!" });
    if (existingUser.status === "Active") {
      const checkPassword = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!checkPassword)
        return res.json({
          status: "invalid",
          message: "Invalid credentials provided",
        });

      const token = accessTokenGenerator(existingUser);
      const refreshToken = jwt.sign(
        { email: existingUser.email, id: existingUser._id },
        refreshConfig.secret
      );
      refreshTokens.push(refreshToken);
      res.status(200).json({
        user: existingUser,
        token,
        refreshToken,
        status: "success",
        message: "Logged In Successfully",
      });
    } else {
      res.json({
        status: "unauthorized",
        message: "Pending Account. Please Verify Your Email!",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Unexpected error" });
  }
};

export const signup = async (req, res) => {
  const { name, phonenumber, email, password, confirmPassword } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(200).json({
        message: "Email already exist!",
      });

    if (password != confirmPassword)
      return res.status(200).json({
        message: "Passwords don't match",
      });

    const hashedPassword = await bcrypt.hash(password, 12);

    const token = jwt.sign({ email }, config.secret, {
      expiresIn: "1h",
    });

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      phonenumber,
      confirmationCode: token,
    });

    sendConfirmationEmail(user.name, user.email, user.confirmationCode);

    // console.log(token);

    res.status(200).json({ user, token, status: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(400).json({
        message: "User Doesn't Exist!",
      });

    if (password != confirmPassword)
      return res.status(400).json({
        message: "Passwords don't match",
      });

    const hashedPassword = await bcrypt.hash(password, 12);

    const token = jwt.sign({ email }, config.secret, {
      expiresIn: "1h",
    });

    const user = await User.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );
    // console.log(token);

    res.status(200).json({ user, token, status: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyUser = (req, res) => {
  const { email, confirmationCode } = req.body;
  User.findOne({ email, confirmationCode })
    .then((user) => {
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.status === "Active")
        return res.status(400).json({ message: "User is already verified" });
      user.status = "Active";
      user.save();
      return res.status(200).json({ message: "User is verified" });
    })
    .catch((error) => {
      return res.status(500).json({ message: error.message });
    });
};

export const verifyToken = (req, res) => {
  const { email, confirmationCode } = req.body;
  User.findOne({ email, confirmationCode })
    .then((user) => {
      if (!user) return res.status(404).json({ message: "Invalid Token" });
      return res.status(200).json({ message: "Valid Token" });
    })
    .catch((error) => {
      return res.status(500).json({ message: error.message });
    });
};

export const forgotPassword = async (req, res) => {
  try {
    console.log("k");
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    console.log(userExists);
    if (!userExists) {
      return res
        .status(200)
        .json({ status: "failed", message: "Email doesn't exists" });
    }
    const token = jwt.sign({ email }, config.secret, {
      expiresIn: "1h",
    });
    const user = await User.updateOne(
      { email: email },
      {
        $set: {
          confirmationCode: token,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    resetPasswordLink(userExists.name, email, token);
    res.status(200).json({
      status: "success",
      message: "Reset link sent to email successfully!",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "Active", role: "user" }).sort(
      "name"
    );
    return res.status(200).json({ users });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
export const refreshToken = (req, res) => {
  //take refresh token from the user

  const token = req.body.token;
  const userId = req.body.userId;

  if (!token) {
    return res.status(401).json({ message: "Not Authenticated" });
  }
  const isVerify = jwt.verify(token, refreshConfig.secret);

  if (isVerify) {
    const user = User.findOne({ _id: userId });
    const accessToken = accessTokenGenerator(user);
    return res.status(200).json({
      token: accessToken,
    });
  } else {
    return res.status(401).json({
      msg: "not verified",
    });
  }
};
