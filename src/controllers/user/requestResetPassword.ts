import { Request, Response } from "express";
import User from "#src/models/user.model";
import sendMail from "#src/utils/sendEmail";

export const requestResetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const data = await User.requestResetPassword(email);

    await sendMail(
      "Email",
      {
        title: "Reset password",
        text: "You request a password reset! Here is your verification code:",
        code: data.token,
        link: "",
      },
      "Reset password. | express-template",
      email
    );

    res.status(200).json({ email: data.user.email });
  } catch (err) {
    res.status(400).json(err);
  }
};
