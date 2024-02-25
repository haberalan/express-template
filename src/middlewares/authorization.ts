import jwt, { JwtPayload } from "jsonwebtoken";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

import User from "../models/user.model";
import { IUser } from "../types/IUser.types";

const authorization = async (
  req: Request & { user: IUser },
  res: Response,
  next: NextFunction
) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Authorization token required!" });
  }

  try {
    const { _id } = jwt.verify(token, process.env.SECRET) as JwtPayload;

    const user = await User.findOne({ _id });

    if (!user) throw Error;

    req.user = user;

    next();
  } catch (err) {
    res.status(401).json({ error: "Request is not authorized." });
  }
};

export default authorization;
