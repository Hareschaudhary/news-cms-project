
import mongoose from "mongoose";
import slugify from "slugify";


const categoriSchema = new mongoose.Schema({
name:{
    type:String,
    required:true,
    unique:true
},
description:{
    type:String,
},
slug:{
    type:String,
    required:true,
    unique:true
},
timestamps:{
    type:Date,
    default:Date.now
}
})

categoriSchema.pre("validate", function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});


const categori = mongoose.model("categori",categoriSchema)

export default categori