import express from "express";

import authorization from "#src/middlewares/authorization";
import {
  signup,
  login,
  signupVerify,
  getAvatar,
  getUser,
  requestResetPassword,
  resetPassword,
  authorize,
  updateAvatar,
  updatePassword,
  deleteUser,
  logoutUser,
  updateProfile,
} from "#src/controllers/user/index";

const router = express.Router();

router.get("/:id", getUser);

router.get("/avatar/:id", getAvatar);

router.post("/signup", signup);

router.post("/login", login);

router.post("/verify/:id", signupVerify);

router.post("/request-reset-password", requestResetPassword);

router.patch("/reset-password/:id", resetPassword);

router.use(authorization);

router.post("/authorize", authorize);

router.patch("/update-avatar", updateAvatar);

router.patch("/update-password", updatePassword);

// router.post('/request-update-email', userController.requestUpdateEmail);

// router.patch('/update-email', userController.updateEmail);

router.patch("/update-profile", updateProfile);

router.delete("/delete", deleteUser);

router.post("/logout", logoutUser);

export { router as userRoutes };
