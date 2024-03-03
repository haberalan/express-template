import { Request, Response } from "express";
import User from "#src/models/user.model";

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.query;
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.resetPassword(id, token as string, newPassword);

    res.status(200).json({ email: user.email });
  } catch (err) {
    res.status(400).json(err);
  }
};
