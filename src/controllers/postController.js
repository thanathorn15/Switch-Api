const fs = require("fs");
const uploadService = require("../services/uploadService");
const { Post, User, Reply, Like, ReswitchProfile } = require("../models");
const postService = require("../services/postService");
const createError = require("../utils/createError");

exports.createPost = async (req, res, next) => {
    try {
        if (
            !req.file &&
            (!req.body.textcontent || !req.body.textcontent.trim())
        ) {
            createError("message or image is required", 400);
        }

        // value for create new post
        const value = {
            userId: req.user.id,
        };

        // value for tag
        const tags = [];

        if (req.body.textcontent && req.body.textcontent.trim()) {
            // console.log(req.body.textcontent);
            const text = req.body.textcontent;

            // ex. #food#sports hello world sfasdfa wfsdf #it #tech
            // seperate all tags from textcontent
            const tagstext = text.split(" ");
            const taglist = tagstext.filter((word) => word.startsWith("#"));

            for (let tagtext of taglist) {
                const result = tagtext.split("#");
                for (let tag of result) {
                    if (tag !== "") tags.push(tag);
                }
            }

            console.log("tags", tags);

            value.textcontent = req.body.textcontent.trim();
        }

        if (req.file) {
            const result = await uploadService.upload(req.file.path);
            value.imgUrl = result.secure_url;
            console.log(value.imgUrl);
        }

        const newPost = await postService.createPost(value);
        const tagRes = tags.map((tag) => postService.createTag(tag));
        const newTags = await Promise.all(tagRes);
        console.log("tags promise", newTags);
        const PostToTagsRes = newTags.map((tag) =>
            postService.createPostToTag(newPost.id, tag.id)
        );
        const newPostToTags = await Promise.all(PostToTagsRes);

        console.log("new posttotags", newPostToTags);
        const post = await Post.findOne({
            where: { id: newPost.id },
            include: User,
        });

        res.status(201).json(post);
    } catch (err) {
        next(err);
    } finally {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
    }
};

exports.createReply = async (req, res, next) => {
    try {
        const { postId } = req.params;
        console.log(postId);

        if (
            !req.file &&
            (!req.body.textcontent || !req.body.textcontent.trim())
        ) {
            createError("message or image is required", 400);
        }

        // check post exist
        const post = await Post.findByPk(postId);

        if (!post) {
            createError("post is not exist");
        }
        // value for create new replay
        const value = {
            userId: req.user.id,
            postId: postId,
        };

        if (req.body.textcontent && req.body.textcontent.trim()) {
            value.textcontent = req.body.textcontent.trim();
        }

        if (req.file) {
            const result = await uploadService.upload(req.file.path);
            value.imageUrl = result.secure_url;
            console.log(value.imageUrl);
        }

        await postService.createReply(value);

        // response
        const newpost = await Post.findAll({
            where: {
                id: post.id,
            },
            include: [
                {
                    model: User,
                },
                {
                    model: Reply,
                    include: User,
                },
            ],
        });

        res.status(201).json(newpost);
    } catch (err) {
        next(err);
    } finally {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
    }
};

exports.editReply = async (req, res, next) => {
    try {
        const { replyId } = req.params;
        const value = req.body;

        const valueObj = {};
        if (value.textcontent) {
            valueObj.textcontent = value.textcontent;
        }

        if (req.file) {
            const result = await uploadService.upload(req.file.path);
            value.image = result.secure_url;
            valueObj.imageUrl = value.image;
        }

        const editReplyValue = await postService.editReply(valueObj, replyId);

        const editDone = await Post.findOne({
            where: {
                id: editReplyValue,
            },
            include: [User, { model: Reply, include: User }],
        });

        res.json(editDone);
    } catch (err) {
        next(err);
    } finally {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
    }
};

exports.togglePostLike = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;
        const existLike = await Like.findOne({
            where: {
                userId: userId,
                postId: postId,
            },
        });
        if (existLike) {
            await existLike.destroy();
        } else {
            await Like.create({
                userId: userId,
                postId: postId,
            });
        }

        res.status(200).json({ message: "success like" });
    } catch (err) {
        next(err);
    }
};

exports.toggleReplyLike = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { replyId } = req.params;
        const existLike = await Like.findOne({
            where: {
                userId: userId,
                replyId: replyId,
            },
        });
        if (existLike) {
            await existLike.destroy();
        } else {
            await Like.create({
                userId: userId,
                replyId: replyId,
            });
        }

        res.status(200).json({ message: "success like reply" });
    } catch (err) {
        next(err);
    }
};

exports.toggleReswitchPost = async (req, res, next) => {
    try {
        const { postId } = req.params;

        // check post exist
        const post = await Post.findByPk(postId);

        if (!post) {
            createError("reference post is not exist", 404);
        }

        // check old reswitch exist
        const oldReswitch = await ReswitchProfile.findOne({
            where: {
                userId: req.user.id,
                postId: postId,
            },
        });

        if (oldReswitch) {
            const reswitchDeleteRes = await postService.deleteReswitch(
                oldReswitch.id
            );

            if (reswitchDeleteRes === 0) {
                createError("error on delete reswitch", 404);
            }

            res.status(200).json({ message: "delete old reswitch post" });
        } else {
            const input = { userId: req.user.id, postId: post.id };

            const reswitchRes = await postService.createReswitch(input);
            console.log("---------->reswitchRes", reswitchRes);

            if (reswitchRes) {
                res.status(200).json({ message: "reswitch post success" });
            }
        }
    } catch (err) {
        next(err);
    }
};

exports.toggleReswitchReply = async (req, res, next) => {
    try {
        const { replyId } = req.params;

        // check post exist
        const reply = await Reply.findByPk(replyId);

        if (!reply) {
            createError("reference reply is not exist", 404);
        }

        // check old reswitch exist
        const oldReswitch = await ReswitchProfile.findOne({
            where: {
                userId: req.user.id,
                replyId: replyId,
            },
        });

        if (oldReswitch) {
            const reswitchDeleteRes = await postService.deleteReswitch(
                oldReswitch.id
            );

            if (reswitchDeleteRes === 0) {
                createError("error on delete reswitch", 404);
            }

            res.status(200).json({ message: "delete old reswitch reply" });
        } else {
            const input = { userId: req.user.id, replyId: reply.id };

            const reswitchRes = await postService.createReswitch(input);
            console.log("---------->reswitchRes", reswitchRes);

            if (reswitchRes) {
                res.status(200).json({ message: "reswitch reply success" });
            }
        }
    } catch (err) {
        next(err);
    }
};

exports.fetchPostById = async (req, res, next) => {
    try {
        const { postId } = req.params;

        const post = await postService.fetchPostById(postId);

        if (!post) createError("reference post is not exist", 404);

        res.status(200).json(post);
    } catch (err) {
        next(err);
    }
};

exports.deleteReply = async (req, res, next) => {
    try {
        const { replyId } = req.params;
        const value = await postService.deleteReply(replyId);
        res.json({ message: "delete reply success" });
    } catch (err) {
        next(err);
    }
};
