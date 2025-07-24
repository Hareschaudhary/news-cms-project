import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
article:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "news",
    required: true
},
name:{
    type: String,
    required: true
},
email:{
       type: String,
         required: true      
},
content:{
    type: String,
    required: true
},
status:{ 
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "pending",
    required: true
}
},{timestamps: true})

const comment = mongoose.model("comments",commentSchema)

export default comment