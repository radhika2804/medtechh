const express = require("express");
const { register, login, getMe, logout, updateProfile } = require("../controllers/auth");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", protect, logout);
router.put("/profile", protect, updateProfile);
router.get("/", (req, res) => {
  res.json({
    message:
      "Welcome to Healthcare Scheduling System API, you can use the following endpoints to interact with the system: /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/logout",
  });
});

module.exports = router;
