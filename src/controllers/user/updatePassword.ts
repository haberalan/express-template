import User from "#src/models/user.model";
import { Request, Response } from "express";
import { IUser } from "#src/types/IUser.types";

export const updatePassword = async (
  req: Request & { user: IUser },
  res: Response
) => {
  const { newPassword } = req.body;
  const user_id = req.user._id;

  try {
    const user = await User.updatePassword(user_id, newPassword);

    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(400).json(err);
  }
};
