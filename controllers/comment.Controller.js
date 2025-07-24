import commentModels from "../models/comment.js";
import newsModels from "../models/news.js";
import settingmodels from "../models/setting.js"

const allComments = async (req, res, next) => {
    // get all comments
    try {
        let allComments = '';
        if (req.role === "admin") {
            allComments = await commentModels.find({})
                                            .populate("article", "title")
                                            .sort({ createdAt: -1 });

        } else {
            const news = await newsModels.find({ author: req.id });
            const newsid = news.map(news => news._id);
            allComments = await commentModels.find({ article: { $in: newsid } })
                                            .populate("article", "title")
                                            .sort({ createdAt: -1 });

        }

          // find all setting
                const settings = await settingmodels.findOne({});
        // return res.json({ allComments });
        res.render("admin/comments/index", { role: req.role, fullname: req.fullname, allComments , settings });
    } catch (error) {
   return next({
            message: "server error",
            status: 500,
            error:error
        });
    }
}

const updateComentStatus = async (req, res) => {
    try {
    const comment = await commentModels.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if(!comment){
    res.status(404).json({ success: false, message: "Comment not Found" });
    }
    res.json({ success: true });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}

const deleteComment = async (req, res) => {
  try {
    const comment = await commentModels.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not Found" });
    }
    await comment.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}
export {
    allComments,
    updateComentStatus,
    deleteComment
}