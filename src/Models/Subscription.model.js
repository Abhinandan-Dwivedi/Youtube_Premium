import mongoose , { Schema } from "mongoose";

const subscriptionSchema = new Schema( 
    {
        // how many subs.. are there 
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User"
    },
       // to which channel the user is subscribed
        channels :{
            type: Schema.Types.ObjectId,
            ref: "User"
    }
}
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema);