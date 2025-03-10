import mongoose from "mongoose";

export interface Clints{
    clintId: mongoose.Schema.Types.ObjectId;
    name: string;
}