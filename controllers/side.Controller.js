import mongoose from "mongoose";

import categoryModels from "../models/categoris.js";
import newsModels from "../models/news.js";
import commentModels from "../models/comment.js";
import userModels from "../models/users.js";
import settingmodels from "../models/setting.js";
import comanPaginaction from "../utilitis/comenPaginaction.js";
import transporter from "../midelware/nodemailer.js";
// import { populate } from "dotenv";

const index = async (req, res, next) => {
    try {

        const search = req.query.search || "";

        // find all news
        // const artcle = await newsModels.find({})
        //     .populate("category", { 'name': 1, 'slug': 1 })
        //     .populate("author", "fullname")
        //     .sort({ createdAt: -1 });

         // find all news with pagination
        const artcle = await comanPaginaction( newsModels,{},
                                         req.query,
                                        {  populate: [
                                            { path: "category",select: "name slug" },
                                            {  path: "author",select: "fullname" }
                                        ],
                                        sort: "-createAt" 
                                        });

        // find category                       
        const categoryinnews = await newsModels.distinct("category");
        const category = await categoryModels.find({ "_id": { $in: categoryinnews } });

        // find letest 5 news
        const letestnews = await newsModels.find({})
                                            .populate("category", { 'name': 1, 'slug': 1 })
                                            .populate("author", "fullname")
                                            .sort({ createAt: -1 }).limit(5);

        //  find setting   
        const setting = await settingmodels.findOne({});

        res.render("index", { artcle, category, search, letestnews, setting ,req:req});

    } catch (error) {
        return next({
            message: "server error",
            status: 500,
            error
        });
    }
}

const articleByCategory = async (req, res, next) => {

    try {
        const search = req.query.search || "";

        // find category by slug
        const categoryslug = await categoryModels.findOne({ slug: req.params.name });
        if (!categoryslug) {
            return next({
            message: "category not found",
            status: 404,
            error
        });
        }

        // find all news
        // const artcle = await newsModels.find({ category: categoryslug._id })
        //                            .populate("category", { 'name': 1, 'slug': 1 })
        //                            .populate("author", "fullname")
        //                            .sort({ createdAt: -1 });
        
        // find all news with pagination
        const artcle = await comanPaginaction( newsModels,{ category: categoryslug._id },
                                         req.query,
                                        {  populate: [
                                            { path: "category",select: "name slug" },
                                            {  path: "author",select: "fullname" }
                                        ],
                                        sort: "-createAt" 
                                        });                           

        // find all category awailible in news  
        const categoryinnews = await newsModels.distinct("category");
        const category = await categoryModels.find({ "_id": { $in: categoryinnews } });

        // find letest 5 news
        const letestnews = await newsModels.find({ category: categoryslug._id })
            .populate("category", { 'name': 1, 'slug': 1 })
            .populate("author", "fullname")
            .sort({ createAt: -1 }).limit(5);

        //  find setting
        const setting = await settingmodels.findOne({});

        res.render("category", { artcle, category, search, categoryname: categoryslug.name, letestnews, setting ,req:req});

    } catch (error) {
            return next({
            message: "server error",
            status: 500,
            error
        });
    }
}

const singleArticle = async (req, res, next) => {
    try {

        const search = req.query.search || "";
        // findById
        const artcle = await newsModels.findById(req.params.id)
                                       .populate("category", { 'name': 1, 'slug': 1 })
                                       .populate("author", "fullname")
                                       .sort({ createdAt: -1 });

        // find all category awailible in news
        const categoryinnews = await newsModels.distinct("category");
        const category = await categoryModels.find({ "_id": { $in: categoryinnews } });

        // find letest 5 news
        const categoryRelated = await categoryModels.findById(artcle.category);
        const letestnews = await newsModels.find({ category: categoryRelated._id })
            .populate("category", { 'name': 1, 'slug': 1 })
            .populate("author", "fullname")
            .sort({ createdAt: -1 })
            .limit(5);

        //  find setting    
        const setting = await settingmodels.findOne({});

        // find this artcle all comment
         const allcoment = await commentModels.find({article:req.params.id,status:"approved"})
                                              .sort({createdAt:-1});
        
                                              
        // find all comment count
        const commentcount = await commentModels.countDocuments({article:req.params.id});

        res.render("single", { artcle, category, search, letestnews, setting ,allcoment,req:req,commentcount});

    } catch (error) {
            return next({
            message: "server error",
            status: 500,
            error
        });
    }
}

const search = async (req, res, next) => {
    try {
        const search = req.query.search || "";

        // find all news
        // const artcle = await newsModels.find({ $or: [ { title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } } ]})
        //                                 .populate("category", { 'name': 1, 'slug': 1 })
        //                                 .populate("author", "fullname")
        //                                 .sort({ createdAt: -1 });

        // find all news with pagination
        const artcle = await comanPaginaction( newsModels,{ $or: [ { title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } } ]},
                                         req.query,
                                        {  populate: [
                                            { path: "category",select: "name slug" },
                                            {  path: "author",select: "fullname" }
                                        ],
                                        sort: "-createdAt" 
                                        });   

        // find category
        const categoryinnews = await newsModels.distinct("category");
        const category = await categoryModels.find({ "_id": { $in: categoryinnews } });

        // find letest 5 news
        const letestnews = await newsModels.find({$or: [{ title: { $regex: search, $options: "i" } },{ content: { $regex: search, $options: "i" } }]})
                                            .populate("category", { 'name': 1, 'slug': 1 })
                                            .populate("author", "fullname")
                                            .sort({ createdAt: -1 }).limit(5);

        //  find setting
        const setting = await settingmodels.findOne({});

        res.render("search", { artcle, category, search, letestnews, setting ,req:req});

    } catch (error) {
            return next({
            message: "server error",
            status: 500,
            error
        });
    }
}

const author = async (req, res, next) => {

    try {
        const search = req.query.search || "";

        // find all news
        // const artcle = await newsModels.find({ author: req.params.name })
        //                                .populate("category", { 'name': 1, 'slug': 1 })
        //                                .populate("author", "fullname")
        //                                .sort({ createdAt: -1 });

        // find all news with pagination
        const artcle = await comanPaginaction( newsModels,{ author: req.params.name },
                                         req.query,
                                        {  populate: [
                                            { path: "category",select: "name slug" },
                                            {  path: "author",select: "fullname" }
                                        ],
                                        sort: "-createdAt" 
                                        });   

        // find category                               
        const categoryinnews = await newsModels.distinct("category");
        const category = await categoryModels.find({ "_id": { $in: categoryinnews } });

        // find letest 5 news
        const letestnews = await newsModels.find({ author: req.params.name })
                                            .populate("category", { 'name': 1, 'slug': 1 })
                                            .populate("author", "fullname")
                                            .sort({ createdAt: -1 }).limit(5);

        //  find setting
        const setting = await settingmodels.findOne({});

        res.render("author", { artcle, category, search, letestnews, setting ,req:req});

    } catch (error) {
               return next({
            message: "server error",
            status: 500,
            error
        });
    }

}

const addComment = async (req, res, next) => {
    const {name,email,content} = req.body;
    try {

        const comment = new commentModels({name,email,content,article:req.params.id});
        await comment.save();
        res.redirect(`/single/${req.params.id}`);
    } catch (error) {
           return next({
            message: "server error",
            status: 500,
            error
        });
    }
 }
const contact = async (req, res) => {
    res.render("contact",{layout:false});
}
 const sendEmail =  async (req, res) => {
  const { email, subject, message } = req.body;
  if (!email || !subject || !message) {
    return res.status(400).json({ message: "Email, subject, and message are required", email, subject, message });
  }
  try {
const info = await transporter.sendMail({
  from: email, 
  to: 'nayanchaudhary539@gmail.com', 
  subject: subject,
  text: `From: ${email}\n\n subject: ${subject}\n\n message: ${message}`,
});
    res.json({ message: "Email sent successfully", info });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
}



export {
    index,
    articleByCategory,
    singleArticle,
    search,
    author,
    addComment,
    sendEmail,
    contact
}