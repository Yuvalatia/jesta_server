const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users-controller");
const tokenValidation = require("../auth/auth-check");

router.post("/register", usersController.userRegister);
router.post("/login", usersController.userLogin);
router.post(
  "/getUserDetails",
  tokenValidation,
  usersController.getUserDetailsByToken
);
router.post("/ownJobs", tokenValidation, usersController.getAllUserJobs);
router.post(
  "/wantedJobs",
  tokenValidation,
  usersController.getAllUserWantedJobs
);
router.post("/assginToJob", tokenValidation, usersController.assignToAJob);

module.exports = router;
