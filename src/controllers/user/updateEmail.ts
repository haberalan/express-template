import User from "#src/models/user.model";
import { Request, Response } from "express";
import { IUser } from "#src/types/IUser.types";

export const updateEmail = async (
  req: Request & { user: IUser },
  res: Response
) => {
  const { _id: user_id } = req.user;
  const { token } = req.body;

  try {
    const user = await User.updateEmail(user_id, token as string);

    res.status(200).json({ email: user.email });
  } catch (err) {
    res.status(400).json(err);
  }
};
