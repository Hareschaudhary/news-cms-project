import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
fullname:{
    type:String,
    required:true
},
username:{
    type:String,
    required:true,
    unique:true,

},
password:{
    type:String,
    required:true,
},
role:{
    type:String,
    enum:["admin","author"],
    default:"author",
    required:true
}
})

UserSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model("user",UserSchema)

export default User