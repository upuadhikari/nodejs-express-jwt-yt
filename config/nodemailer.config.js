import nodemailer from "nodemailer";
import { config } from "../config/auth.config.js";

const user = config.user;
const pass = config.pass;

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: user,
    pass: pass,
  },
});

export default transport;
