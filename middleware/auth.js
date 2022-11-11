import jwt from "jsonwebtoken";
import env from "dotenv";

export const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    let decodeToken = jwt.verify(token, process.env.APP_SECRET_TOKEN);
    req.userId = decodeToken && decodeToken.id;
    next();
  } catch (error) {
    console.log(error);
  }
};
