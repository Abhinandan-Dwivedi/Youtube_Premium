import AsyncHandler from '../Utils/AsyncHandler.js';
import User from '../Models/userModel.js';
import Showerror from '../Utils/Showerror.js';
import Uploadoncloudinary  from '../Utils/CloudinaryUpload.js';
import apiresponse from '../Utils/ApiResponse.js';

const Registeruser   = AsyncHandler( async(req, res) => {

    const { username, fullname, email, password } = req.body;
    if ( [username, fullname, email, password].some( (field)=>{
        return field.trim() === ""; }) ) 
    {
        throw new Showerror( 400, "All fields are required" );
    }

    // check if user already exists
    const existingUser = await user.findOne({  $or : [ { email }, { username } ] });
    if  ( existingUser ) {
        throw new Showerror( 400, "User already exists with this email or username" );
    }

    // create new user 
    const avatarlocalpath = await req.files?.avatar[0]?.path;
    const coverImagelocalpath = await req.files?.coverImage[0]?.path;

    if ( !avatarlocalpath ) {
        throw new Showerror( 400, "Avatar image is required" );
    }

    const avatar = await Uploadoncloudinary(avatarlocalpath);
    const coverImage = coverImagelocalpath ? await Uploadoncloudinary(coverImagelocalpath) : null;

    if ( !avatar ) {
        throw new Showerror( 500, "Error uploading avatar image" );
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
    if ( !newuser ) {
        throw new Showerror( 500, "Error creating user" );
    }

    const removeuserfields  = await newuser.findById(newuser._id).select("-password -refreshToken");
    if ( !removeuserfields ) {
        throw new Showerror( 500, "Error retrieving user data" );
    }

    return res.status(201).json(new apiresponse( 201, "User registered successfully", removeuserfields ));
})

export default Registeruser;