import jwt from "jsonwebtoken";
import multer from "multer";
import sharp from "sharp";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { Buffer } from "buffer";
import mongoose from "mongoose";
import { Request, Response } from "express";

import { createToken } from "../utils/createToken";

import User from "../models/user.model";
import { IUser } from "../types/IUser.types";

import sendMail from "../utils/sendEmail";

const getUser = async (
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

const login = async (req: Request, res: Response) => {
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

const signup = async (
  req: Request & {
    username: string;
    password: string;
    email: string;
  },
  res: Response
) => {
  const { username, password, email } = req.body;

  try {
    const user = await User.signup(username, email, password);

    // create verify email
    // const url = `${process.env.CLIENT_URL}/verify-email/${user.verified}`;
    // await sendMail(email, url);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const verify = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { token } = req.query;

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

const getAvatar = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    const dataBSON = JSON.stringify(user.avatar);

    const dataJSON = await JSON.parse(dataBSON);

    const dataBuffer = await Buffer.from(dataJSON.buffer.data);

    res.end(dataBuffer);
  } catch (err) {
    res.status(400).json({ global: "There was an error." });
  }
};

const requestResetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.requestResetPassword(email);

    res.status(200).json({ email: user.email });
  } catch (err) {
    res.status(400).json(err);
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.query;
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.resetPassword(id, token as string, newPassword);

    res.status(200).json({ email: user.email });
  } catch (err) {
    res.status(400).json(err);
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
      cb(new Error("Only images are allowed."));
    }
  },
});

const updateAvatar = [
  upload.any(),
  async (req: Request & { user: IUser }, res: Response) => {
    const user_id = req.user._id;

    try {
      if (!req.files[0]) throw { global: "Please provide an image." };

      const avatar = await sharp(req.files[0].buffer)
        .resize(200, 200)
        .png({ quality: 100 })
        .toBuffer();

      const user = await User.updateAvatar(user_id, avatar);

      res.status(200).json({ username: user.username });
    } catch (err) {
      res.status(400).json(err);
    }
  },
];

const updatePassword = async (
  req: Request & { user: IUser },
  res: Response
) => {
  const { newPassword } = req.body;
  const user_id = req.user._id;

  try {
    const user = await User.updatePassword(user_id, newPassword);

    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(400).json(err);
  }
};

const requestUpdateEmail = async (
  req: Request & { user: IUser },
  res: Response
) => {};

const updateEmail = async (req: Request & { user: IUser }, res: Response) => {};

const updateProfile = async (
  req: Request & { user: IUser },
  res: Response
) => {};

const deleteUser = async (req: Request & { user: IUser }, res: Response) => {
  const user_id = req.user._id;

  try {
    const user = await User.deleteUser(user_id);

    // delete all data associated with user

    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
      })
      .json({ username: user.username });
  } catch (err) {
    res.status(400).json(err);
  }
};

const logoutUser = async (req: Request, res: Response) => {
  const cookies = req.cookies.token;

  try {
    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
      })
      .json({ global: "User logged out." });
  } catch (err) {
    res.status(400).json({ global: err.message });
  }
};

export default {
  getUser,
  getAvatar,
  login,
  signup,
  verify,
  requestResetPassword,
  resetPassword,
  authorize,
  updateAvatar,
  updatePassword,
  deleteUser,
  logoutUser,
};
