import path from "path";
import categoryModels from "../models/categoris.js";
import newsModels from "../models/news.js";
import settingmodels from "../models/setting.js"
import commentModels from "../models/comment.js"
import { validationResult } from "express-validator";
import fs from "fs";
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import getCloudinaryPublicId from "../utilitis/cloudnaryPublicID.js"

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const allArtcles = async (req, res, next) => {
    try {
        var artcles = ""
        if (req.role == "admin") {
            artcles = await newsModels.find({}).populate("category", "name").populate("author", "fullname");
        }
        else {
            artcles = await newsModels.find({ author: req.id }).populate("category", "name").populate("author", "fullname");
        }
        // find all setting
        const settings = await settingmodels.findOne({});
        res.render("admin/artcles/index", {
            artcles,
            role: req.role,
            fullname: req.fullname,
            settings,
            req: req
        });
    } catch (error) {
        return next({
            message: "server error",
            status: 500,
            error: error
        });
    }
}

const addArtclePage = async (req, res, next) => {
    try {
        const categories = await categoryModels.find({});

        // find all setting
        const settings = await settingmodels.findOne({});
        res.render("admin/artcles/create",
            {
                categories,
                role: req.role,
                fullname: req.fullname,
                errors: [],
                olddata: null,
                settings,
                req: req
            });
    } catch (err) {
        return next({
            message: "server error",
            status: 500,
            error: err
        });
    }
}

const addArtcle = async (req, res, next) => {
 
    // validaction
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // find all category
        const categories = await categoryModels.find({});
        // find all setting
        const settings = await settingmodels.findOne({});

        // uploded image delete
        if(req.cloudinaryUrl){
            const oldImagePublicId = getCloudinaryPublicId(req.cloudinaryUrl);
            if (oldImagePublicId) {
                try {
                    await cloudinary.uploader.destroy(oldImagePublicId, { invalidate: true });
                    console.log("Deleted from Cloudinary:", oldImagePublicId);
                } catch (err) {
                    if (err.message !== 'not found') {
                        console.log("Error deleting from Cloudinary:", err);
                    }
                }
            }
        }

        return res.render("admin/artcles/create",
            {
                categories,
                role: req.role,
                fullname: req.fullname,
                errors: errors.array(),
                olddata: req.body,
                settings,
                req: req
            });
    }

    try {
        const { title, content, category } = req.body;
         
        const artcle = new newsModels({
            title,
            content,
            category,
            author: req.id,
            image: req.cloudinaryUrl || null
        })
        await artcle.save();
        res.redirect("/admin/artcle",);
    } catch (error) {
        return next({
            message: "server error",
            status: 500,
            error: error
        });
    }
}

const updateArtclePage = async (req, res, next) => {
    try {
        const artcle = await newsModels.findById(req.params.id).populate("category", "name").populate("author", "fullname");
        if (!artcle) {
            return next({
                message: "artcle not found",
                status: 404,
                error: ''
            });
        }
        if (req.role == "author") {
            if (req.id != artcle.author._id) {
                return next({
                    message: "Unauthorized",
                    status: 401,
                    error: ''
                });
            }
        }

        const categories = await categoryModels.find({});
        // find all setting
        const settings = await settingmodels.findOne({});
        res.render("admin/artcles/update", {
            categories,
            artcle,
            role: req.role,
            fullname: req.fullname,
            errors: [],
            settings,
            req: req
        });
    } catch (error) {
        return next({
            message: "server error",
            status: 500,
            error: error
        });
    }
}

const updateArtcle = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //  const artcle = await newsModels.findById(req.params.id).populate("category", "name").populate("author", "fullname");
        const categories = await categoryModels.find({});

        // find all setting
        const settings = await settingmodels.findOne({});
        return res.render("admin/artcles/update", {
            categories: categories,
            artcle: req.body,
            role: req.role,
            fullname: req.fullname,
            errors: errors.array(),
            settings,
            req: req
        });
    }
    try {
        const { title, content, category, oldImage } = req.body;
        const artcle = await newsModels.findById(req.params.id);
        if (!artcle) {
            return next({
                message: "artcle not found",
                status: 404,
                error: ''
            });
        }
        if (req.role == "author") {
            if (req.id != artcle.author._id) {
                return next({
                    message: "Unauthorized",
                    status: 401,
                    error: ''
                });
            }
        }
        artcle.title = title
        artcle.content = content
        artcle.category = category
    if (req.file) {
    const oldImagePublicId = getCloudinaryPublicId(oldImage);

    if (oldImagePublicId) {
        try {
            await cloudinary.uploader.destroy(oldImagePublicId, { invalidate: true });
            console.log("Deleted from Cloudinary:", oldImagePublicId);
        } catch (err) {
            if (err.message !== 'not found') {
                console.log("Error deleting from Cloudinary:", err);
            }
        }
    }

    artcle.image = req.cloudinaryUrl;
}

        await artcle.save();
        res.redirect("/admin/artcle");
    } catch (error) {
        return next({
            message: "server error",
            status: 500,
            error: error
        });
    }
}
const deleteArtcle = async (req, res, next) => {
    try {
        const artcle = await newsModels.findById(req.params.id);
        if (!artcle) {
            return next({
                message: "artcle not found",
                status: 404,
                error: ''
            });
        }
        if (req.role == "author") {
            if (req.id != artcle.author._id) {
                return next({
                    message: "Unauthorized",
                    status: 401,
                    error: ''
                });
            }
        }

        const oldImagePublicId = getCloudinaryPublicId(artcle.image);

        if (oldImagePublicId) {
            try {
                await cloudinary.uploader.destroy(oldImagePublicId, { invalidate: true });
                console.log("Deleted from Cloudinary:", oldImagePublicId);
            } catch (err) {
                if (err.message !== 'not found') {
                    console.log("Error deleting from Cloudinary:", err);
                }
            }
        }

        
        await newsModels.findByIdAndDelete(req.params.id);

        // delete artcle comments
        const ThisArticleComments = await commentModels.find({ article: req.params.id });
        if (ThisArticleComments && ThisArticleComments.length > 0) {
            await commentModels.deleteMany({ article: req.params.id });
        }

        res.send({ success: true });
    } catch (error) {
        return next({
            message: "server error",
            status: 500,
            error: error
        });
    }
}


export {
    allArtcles,
    addArtclePage,
    addArtcle,
    updateArtclePage,
    updateArtcle,
    deleteArtcle
}