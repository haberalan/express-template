import User from "#src/models/user.model";
import { Request, Response } from "express";
import { IUser } from "#src/types/IUser.types";
import sendMail from "#src/utils/sendEmail";

export const requestUpdateEmail = async (
  req: Request & { user: IUser },
  res: Response
) => {
  const { email } = req.body;
  const user_id = req.user._id;

  try {
    const data = await User.requestUpdateEmail(user_id, email);

    await sendMail(
      "Email",
      {
        title: "Change email",
        text: "You request a email change! Here is your verification code:",
        code: data.token,
        link: "",
      },
      "Email update.",
      email
    );

    res.status(200).json({ email: data.user.emailUpdate.newEmail });
  } catch (err) {
    res.status(400).json(err);
  }
};
