import AsyncHandler from '../Utils/AsyncHandler.js';
import { Video } from '../Models/Vedio.model.js';
import Showerror from '../Utils/ShowError.js';
import { Uploadoncloudinary, deletingfilefromcloudinary } from '../Utils/cloudinary.js';
import ApiResponse from '../Utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const uploadvideo = AsyncHandler(async (req, res) => {

    const videolocalpath = req.files?.video[0]?.path;
    const thumbnailpath = req.files?.thumbnail[0]?.path;
    if (!videolocalpath || !thumbnailpath) {
        throw new Showerror(400, "Please upload a video and thumbnail");
    }

    const { title, description, publiced } = req.body;
    if (!title || !description || !publiced) {
        throw new Showerror(400, "Title and description are required");
    }

    const videoresult = await Uploadoncloudinary(videolocalpath);
    const thumbnailresult = await Uploadoncloudinary(thumbnailpath);

    const video = await Video.create({
        videoFile: videoresult?.url,
        thumbnail: thumbnailresult?.url,
        owner: req.user._id,
        title,
        description,
        isPublished: publiced === "true" ? true : false
    })

    if (!video) {
        throw new Showerror(500, "Failed to upload video");
    }
    return res.status(201).json(new ApiResponse(201, "Video uploaded successfully", video));
})

const deletevideo = AsyncHandler(async (req, res) => {
    const videoId = req.params.id;
    if (!videoId) {
        throw new Showerror(400, "Video id is required");
    }

    // Validate if videoId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new Showerror(400, "Invalid video id");
    }

    const deletedvideo = await Video.findById(videoId);
    if (!deletedvideo) {
        throw new Showerror(404, "Video not found");
    }

    if (deletedvideo.owner.toString() !== req.user._id.toString()) {
        throw new Showerror(403, "You are not authorized to delete this video");
    }

    if (deletedvideo.videoFile) {
        const publicId = deletedvideo.videoFile.split("/").pop().split(".")[0];
        await deletingfilefromcloudinary(publicId);
    }
    if (deletedvideo.thumbnail) {
        const publicId = deletedvideo.thumbnail.split("/").pop().split(".")[0];
        await deletingfilefromcloudinary(publicId);
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new ApiResponse(200, "Video deleted successfully", deletedvideo));
})
export {
    uploadvideo,
    deletevideo
};

