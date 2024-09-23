import { Request, Response } from "express";
import { IUser } from "#src/types/IUser.types";

export const authorize = async (
  req: Request & { user: IUser },
  res: Response
) => {
  const user = req.user;

  res.status(200).json({
    _id: user.id,
    avatar: Boolean(user.avatar),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    passwordLastUpdated: user.passwordLastUpdated,
    createdAt: user.createdAt,
  });
};
