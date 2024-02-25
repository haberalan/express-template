import express from "express";

import userController from "../controllers/user.controller";
import isAuthorized from "../middlewares/isAuthorized";

const router = express.Router();

router.post("/login", userController.login);

router.post("/signup", userController.signup);

router.post("/request-password-reset", userController.requestResetPassword);

router.patch("/reset-password", userController.resetPassword);

router.get("/avatar/:id", userController.getAvatar);

router.use(isAuthorized);

router.get("/authorize", userController.authorize);

router.patch("/update-avatar", userController.updateAvatar);

router.patch("/update-password", userController.updatePassword);

router.delete("/delete", userController.deleteUser);

export { router as userRoutes };
