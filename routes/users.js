const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users-controller");
const tokenValidation = require("../auth/auth-check");

router.post("/register", usersController.userRegister);
router.post("/login", usersController.userLogin);
router.post("/ownJobs", tokenValidation, usersController.getAllUserJobs);
module.exports = router;
