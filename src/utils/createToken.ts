import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

const createToken = (_id: ObjectId, expiresIn?: string) => {
  return jwt.sign({ _id }, process.env.SECRET, expiresIn && { expiresIn });
};

export { createToken };
