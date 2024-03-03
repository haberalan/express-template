import { Request, Response } from "express";
import { IUser } from "#src/types/IUser.types";

export const authorize = async (
  req: Request & { user: IUser },
  res: Response
) => {
  const { username } = req.user;

  res.status(200).json({ username });
};
