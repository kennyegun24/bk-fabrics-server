const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const header = req.headers?.token;
  console.log(header);
  if (header) {
    const token = header.split(" ")[1];
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
      if (err) return res.status(403).json("Token not valid");
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated");
  }
};

const verifyTokenAndAuthz = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.is_admin) {
      next();
    } else {
      res.status(403).json("You are not allowed");
    }
  });
};

const verifyAdminToken = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req?.user?.is_admin) {
      next();
    } else {
      res.status(403).json("Only admins are allowed");
    }
  });
};

module.exports = { verifyToken, verifyTokenAndAuthz, verifyAdminToken };
