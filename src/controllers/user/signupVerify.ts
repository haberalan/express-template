import { Request, Response } from "express";
import User from "#src/models/user.model";

export const signupVerify = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { token } = req.body;

  try {
    const user = await User.verify(token as string, id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};
