import express from "express";

import userController from "../controllers/user.controller";
import authorization from "../middlewares/authorization";

const router = express.Router();

router.get("/:id", userController.getUser);

router.get("/avatar/:id", userController.getAvatar);

router.post("/signup", userController.signup);

router.post("/login", userController.login);

router.post("/verify/:id", userController.verify);

router.post("/request-reset-password", userController.requestResetPassword);

router.patch("/reset-password/:id", userController.resetPassword);

router.use(authorization);

router.post("/authorize", userController.authorize);

router.patch("/update-avatar", userController.updateAvatar);

router.patch("/update-password", userController.updatePassword);

// router.post('/request-update-email', userController.requestUpdateEmail);

// router.patch('/update-email', userController.updateEmail);

// router.patch('/update-profile', userController.updateProfile);

router.delete("/delete", userController.deleteUser);

router.post("/logout", userController.logoutUser);

export { router as userRoutes };
