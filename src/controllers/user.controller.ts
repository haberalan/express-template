import jwt from "jsonwebtoken";
import multer from "multer";
import sharp from "sharp";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { Buffer } from "buffer";
import { ObjectId } from "mongoose";
import { Request, Response } from "express";

import User from "../models/user.model";
import { IUser } from "../types/IUser.types";

import Token from "../models/token.model";
import sendMail from "../utils/sendEmail";

const createToken = (_id: ObjectId, expiresIn: string | number | null) => {
  return jwt.sign({ _id }, process.env.SECRET, expiresIn && { expiresIn });
};

const login = async (
  req: Request & {
    username: string;
    password: string;
    expiresIn: boolean;
  },
  res: Response
) => {
  const { username, password, expiresIn } = req.body;

  try {
    const user = await User.login(username, password);

    const token = createToken(user._id, !expiresIn && "24h");

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      updatedAt: user.updatedAt,
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const signup = async (
  req: Request & {
    username: string;
    email: string;
    password: string;
    expiresIn: string | number | null;
  },
  res: Response
) => {
  const { username, email, password, expiresIn } = req.body;

  try {
    const user = await User.signup(username, email, password);

    const token = createToken(user._id, !expiresIn && "24h");

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      updatedAt: user.updatedAt,
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const requestResetPassword = async (
  req: Request & { email: string },
  res: Response
) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) throw Error("There is no user asssociated with this email.");

    const isAlreadyToken = await Token.findOne({ user_id: user._id });

    if (isAlreadyToken) await isAlreadyToken.deleteOne();

    const resetToken = crypto.randomBytes(32).toString("hex");

    const salt = await bcrypt.genSalt(10);

    const hashedResetToken = await bcrypt.hash(resetToken, salt);

    await Token.create({
      user_id: user._id,
      token: hashedResetToken,
      createdAt: Date.now(),
    });

    const link = `${process.env.CLIENT_URL}auth/reset?token=${resetToken}&id=${user._id}`;

    await sendMail(
      "RequestPasswordReset",
      { link: link },
      "Password Reset",
      user.email
    );

    res.status(200).json({ email: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const resetPassword = async (
  req: Request & { user_id: string; token: string; password: string },
  res: Response
) => {
  const { user_id, token, password } = req.body;

  try {
    if (!user_id || !password)
      throw Error("Invalid or expired password reset token.");

    const passwordResetToken = await Token.findOne({ user_id });

    if (!passwordResetToken || !token)
      throw Error("Invalid or expired password reset token.");

    const isValidToken = await bcrypt.compare(token, passwordResetToken.token);

    if (!isValidToken) throw Error("Invalid or expired password reset token.");

    const user = await User.updatePassword(user_id, password);

    await passwordResetToken.deleteOne();

    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAvatar = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    const dataBSON = JSON.stringify(user.avatar);

    const dataJSON = await JSON.parse(dataBSON);

    const dataBuffer = await Buffer.from(dataJSON.buffer.data);

    res.end(dataBuffer);
  } catch (err) {
    res.status(400).json({ error: "There was an error" });
  }
};

const authorize = async (req: Request & { user: IUser }, res: Response) => {
  const { username } = req.user;

  res.status(200).json({ username });
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  },
});

const updateAvatar = [
  upload.single("avatar"),
  async (req: Request & { user: IUser }, res: Response) => {
    const user_id = req.user._id;

    try {
      const avatar = await sharp(req.file.buffer)
        .resize(200, 200)
        .png({ quality: 100 })
        .toBuffer();

      const user = await User.updateAvatar(user_id, {
        data: avatar,
        type: "image/png",
      });

      res.status(200).json({ username: user.username });
    } catch (err) {
      res.status(400).json({ error: "There was an error." });
    }
  },
];

const updatePassword = async (
  req: Request & { user: IUser },
  res: Response
) => {
  const user_id = req.user._id;
  const { newPassword } = req.body;

  try {
    const user = await User.updatePassword(user_id, newPassword);

    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteUser = async (req: Request & { user: IUser }, res: Response) => {
  const user_id = req.user._id;

  try {
    const user = await User.deleteUser(user_id);

    // delete all data associated with user

    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export default {
  login,
  signup,
  requestResetPassword,
  resetPassword,
  getAvatar,
  authorize,
  updateAvatar,
  updatePassword,
  deleteUser,
};
