const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users-controller");

router.post("/register", usersController.userRegister);
router.post("/login", usersController.userLogin);

module.exports = router;
