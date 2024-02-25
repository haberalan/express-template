import mongoose from "mongoose";

import { IToken, ITokenModel } from "../types/IToken.types";

const Schema = mongoose.Schema;

const tokenSchema = new Schema<IToken, ITokenModel>({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

export default mongoose.model<IToken, ITokenModel>("Token", tokenSchema);
