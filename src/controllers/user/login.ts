import { Request, Response } from "express";
import User from "#src/models/user.model";
import { createToken } from "#src/utils/createToken";

export const login = async (req: Request, res: Response) => {
  const { username, password, longSession } = req.body;

  try {
    const user = await User.login(username, password);

    if (user.verified.length)
      throw {
        global: "Please verify your email address.",
      };

    const token = createToken(user._id, longSession ? "30d" : "1d");

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        domain: process.env.DOMAIN,
        expires: new Date(
          Date.now() + (longSession ? 30 : 1) * 24 * 60 * 60 * 1000
        ),
      })
      .status(200)
      .json({
        _id: user.id,
        avatar: Boolean(user.avatar),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        passwordLastUpdated: user.passwordLastUpdated,
        createdAt: user.createdAt,
      });
  } catch (err) {
    res.status(400).json(err);
  }
};
