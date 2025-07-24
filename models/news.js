import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";


const newsSchema = new mongoose.Schema({
title:{
    type:String,
    required:true,
},
content:{
    type:String,
    required:true,
},
category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"categori",
    required:true
},
author:{
    type:mongoose.Schema.Types.ObjectId, 
    ref:"user",
    required:true
},
image:{
    type:String,
    required:true,
},
createAt:{
    type:Date,
    default:Date.now
}
})

newsSchema.plugin(mongoosePaginate);

const news = mongoose.model("news",newsSchema)

export default news