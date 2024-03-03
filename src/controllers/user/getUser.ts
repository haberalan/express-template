import { Request, Response } from "express";
import User from "#src/models/user.model";
import mongoose from "mongoose";

export const getUser = async (
  req: Request & {
    params: {
      id: string;
    };
  },
  res: Response
) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw {
        global: "User ID is invalid.",
      };

    const user = await User.findById(id);

    if (!user)
      throw {
        global: "User not found.",
      };

    res.status(200).json({
      _id: user._id,
      username: user.username,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};
