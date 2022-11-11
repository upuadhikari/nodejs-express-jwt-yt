// import mongoose from "mongoose";

// const userSchema = mongoose.Schema({
//   id: { type: String },
//   name: { type: String, require: true },
//   phonenumber: { type: Number, require: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
// });

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name"],
      maxlength: 50,
      minlength: 3,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    phonenumber: {
      type: Number,
      require: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Active"],
      default: "Pending",
    },
    confirmationCode: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
    },
    noOfNotification: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre('save', async function () {
//   const salt = await bcrypt.genSalt(10)
//   this.password = await bcrypt.hash(this.password, salt)
// })

userSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    "process.env.JWT_SECRET",
    {
      expiresIn: "30d",
    }
  );
};

userSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

export default mongoose.model("User", userSchema);
