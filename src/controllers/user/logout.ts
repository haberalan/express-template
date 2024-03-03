import { Request, Response } from "express";
import User from "#src/models/user.model";

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
      })
      .json({ global: "User logged out." });
  } catch (err) {
    res.status(400).json({ global: err.message });
  }
};
