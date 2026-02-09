import AsyncHandler from '../Utils/AsyncHandler.js';
import { User } from '../Models/User.model.js';
import Showerror from '../Utils/ShowError.js';
import { Uploadoncloudinary, deletingfilefromcloudinary } from '../Utils/cloudinary.js';
import ApiResponse from '../Utils/ApiResponse.js';
// import asyncHandler from '../Utils/AsyncHandler.js';
import jwt from 'jsonwebtoken';


const generateaccess_refressToken = async (userid) => {
    try {
        const user = await User.findById(userid);
        if (!user) {
            throw new Showerror(500, "Error generating token");
        }

        const accessToken = user.generatetoken();
        const refreshToken = user.Refreshtoken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Showerror(500, "Error generating tokens");
    }
}
const Registeruser = AsyncHandler(async (req, res) => {

    // const username = req.body.username;
    // return res.status(200).json(  username );

    const { username, fullname, email, password } = req.body;
    if ([username, fullname, email, password].some((field) => {
        return field.trim() === "";
    })) {
        throw new Showerror(400, "All fields are required");
    }

    // check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new Showerror(400, "User already exists with this email or username");
    }

    // create new user 
    const avatarlocalpath = await req.files?.avatar[0]?.path;
    const coverImagelocalpath = await req.files?.coverImage[0]?.path;

    if (!avatarlocalpath) {
        throw new Showerror(400, "Avatar image is required");
    }

    const avatar = await Uploadoncloudinary(avatarlocalpath);
    const coverImage = coverImagelocalpath ? await Uploadoncloudinary(coverImagelocalpath) : null;

    if (!avatar) {
        throw new Showerror(500, "Error uploading avatar image");
    }

    // create new user in database
    const newuser = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    if (!newuser) {
        throw new Showerror(500, "Error creating user");
    }

    const removeuserfields = await User.findById(newuser._id).select("-password -refreshToken");
    if (!removeuserfields) {
        throw new Showerror(500, "Error retrieving user data");
    }

    return res.status(201).json(new apiresponse(201, "User registered successfully", removeuserfields));
})

const Login = AsyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if ([username, email, password].some((field) => {
        return field.trim() === "";
    })) {
        throw new Showerror(400, "All fields are required");
    }

    const validateuser = await User.findOne({ $or: [{ email }, { username: username.toLowerCase() }] });
    if (!validateuser) {
        throw new Showerror(400, "Invalid credentials");
    }

    const passwordmatch = await validateuser.comparepassword(password);
    if (!passwordmatch) {
        throw new Showerror(400, "Invalid Password");
    }

    const { accessToken, refreshToken } = await generateaccess_refressToken(validateuser._id);

    const logedinuser = await User.findById(validateuser._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, "User logged in successfully", logedinuser));

})

const Logout = AsyncHandler(async (req, res) => {
    await User.findOneAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    )
    const option = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, "User logged out successfully", null));

})

const refreshaccesstoken = AsyncHandler( async (req, res)=> {
    
    const oldrefreshToken = req.cookies?.refreshToken || req.body.refreshToken; 
    if (!oldrefreshToken) {
        throw new Showerror(401, "Refresh token not found");
    }

    try {
        const decodedtoken = jwt.verify(oldrefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if ( !decodedtoken || !decodedtoken._id ) {
            throw new Showerror(401, "Invalid refresh token");
        }
        
        const user = User.findById(decodedtoken._id);
        if ( !user || user.refreshToken !== oldrefreshToken ) {
            throw new Showerror(401, "Invalid refresh token, user not found or token mismatch");
        }
    
        const { accessToken, newrefreshToken } = await generateaccess_refressToken(user._id);
    
        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(200, "Access token refreshed successfully", { accessToken, refreshToken : newrefreshToken })
            );
    
    } catch (error) {
        throw new Showerror(401, "catch error: Invalid refresh token ");
    }
})

const changecurrentpassword = AsyncHandler( async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if ( [currentPassword, newPassword].some((field) => {
        return field.trim() === "";
    }) ) {
        throw new Showerror(400, "All fields are required");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new Showerror(404, "changeCurrentPassword: User not found");
    }

    const isMatch = await user.ComparePassword(currentPassword);
    if (!isMatch) {
        throw new Showerror(400, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save( {validateBeforeSave: false} );

    return res.status(200).json(new ApiResponse(200, "Password changed successfully", null));

});

const getcurrentuser = AsyncHandler( async (req, res) => {
    const user = await User.findById(req.user?._id).select("-password -refreshToken");
    if (!user) {
        throw new Showerror(404, "getCurrentUser: User not found");
    }
    return res.status(200).json(new ApiResponse(200, "Current user retrieved successfully", user));
}) 

const updateuserdetails = AsyncHandler( async (req, res) => {
    const { fullname, username } = req.body;
    if ( [fullname, username].some((field) => {
        return field.trim() === "";
    }) ) {
        throw new Showerror(400, "updateuserdetails: All fields are required");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new Showerror(404, "updateUserDetails: User not found");
    }

    user.fullname = fullname;
    user.username = username.toLowerCase();
    await user.save( {validateBeforeSave: false} );

    const updateduser = await User.findById(req.user?._id).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, "User details updated successfully", updateduser));
})

const updateAvatarimg = AsyncHandler( async (req, res) => {

    const { newavatar } = req.file;
    if ( !newavatar ) {
        throw new Showerror(400, "updateAvatarimg: New avatar image is required");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new Showerror(404, "updateAvatarimg: User not found");
    }

    // deteting the old avatar image from cloudinary
    if ( user.avatar ) {
        const publicId = user.avatar.split("/").pop().split(".")[0];
        deletingfilefromcloudinary(publicId);
    }

    // udating the avatar 
    const avatar = await Uploadoncloudinary(newavatar.path);
    if (!avatar) {
        throw new Showerror(500, "updateAvatarimg: Error uploading new avatar image");
    }
    const updatedavatar = User.findByIdAndUpdate(
        req.user._id,
        {
             $set: { 
                avatar: avatar.url
                 }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, "Avatar image updated successfully", updatedavatar));
    
})


export {
    Registeruser,
    Login,
    Logout,
    refreshaccesstoken,
    changecurrentpassword,
    getcurrentuser,
    updateuserdetails
};