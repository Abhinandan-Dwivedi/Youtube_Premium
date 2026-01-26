import AsyncHandler from '../Utils/AsyncHandler.js';

const Registeruser   = AsyncHandler( async(req, res) => {



    res.status(200).json({message: "User Registered Successfully"});
})
export default Registeruser;