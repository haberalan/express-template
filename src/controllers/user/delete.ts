import { Request, Response } from "express";
import User from "#src/models/user.model";
import { IUser } from "#src/types/IUser.types";

export const deleteUser = async (
  req: Request & { user: IUser },
  res: Response
) => {
  const user_id = req.user._id;

  try {
    const user = await User.deleteUser(user_id);

    // delete all data associated with user

    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
      })
      .json({ username: user.username });
  } catch (err) {
    res.status(400).json(err);
  }
};
