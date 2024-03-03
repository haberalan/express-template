import { Request, Response } from "express";
import User from "#src/models/user.model";
import sendMail from "#src/utils/sendEmail";

export const signup = async (
  req: Request & {
    username: string;
    password: string;
    email: string;
  },
  res: Response
) => {
  const { username, password, email } = req.body;

  try {
    const data = await User.signup(username, email, password);

    await sendMail(
      "Email",
      {
        title: "Signed up",
        text: "Thank you for signing up! Here is your verification code:",
        code: data.token,
        link: "",
      },
      "Welcome to our app!",
      email
    );

    res.status(201).json({
      _id: data.user._id,
      username: data.user.username,
      email: data.user.email,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};
