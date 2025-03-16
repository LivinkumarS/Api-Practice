import jwt from "jsonwebtoken";

const identifyUser = async (req, res, next) => {
  let token;
  if (req.headers.client === "not-browser") {
    token = req.headers.authorization;
  } else {
    token = req.cookies["Authorization"];
  }

  if (!token) {
    return res.status(400).json({ success: false, message: "Unknown User" });
  }

  try {
    const user = jwt.verify(token.split(" ")[1], process.env.TOKEN_SECRET);

    if (user) {
      req.user = user;
      next();
    }
  } catch (err) {
    throw new Error("Error in the token");
  }
};

export default identifyUser;
