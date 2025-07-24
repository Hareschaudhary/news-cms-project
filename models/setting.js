import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    website_name: {
        type: String,
        required: true,
      
    },
    website_description: {
        type: String,
        required: true,
      
    },
    website_image: {
        type: String,
        required: true,
      
    }
})

const settings = mongoose.model("settings", settingsSchema)
export default settings