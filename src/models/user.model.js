import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
           
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
           
        },
        avatar:{
            type:String,  // cloudnary url
            required:true,
        },
        coverImage:{
            type:String,  // cloudnary url
            
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true,'Password is required']
        },
        refreshToken:{
            type:String,
          
        }
    },
    {timestamps:true}
)

// Pre-save middleware for Mongoose schema
userSchema.pre("save", async function (next) {
    // Check if the 'password' field has been modified
    // If the password hasn't changed, skip hashing
    if (!this.isModified("password")) {
        return next(); // Move to the next middleware or save operation
    }

    // If password is modified (e.g., during signup or password change), hash it
    // bcrypt.hash(password, saltRounds) returns a Promise
    this.password = await bcrypt.hash(this.password, 10); // 10 is the salt rounds (work factor)

    // Call next() to continue with the save operation
    next();
});

// Add a custom instance method to the user schema
userSchema.methods.isPasswordCorrect = async function (password) {
    // 'password' is the plain text password entered by the user
    // 'this.password' is the hashed password stored in the database

    // bcrypt.compare() hashes the plain password and compares it with the stored hash
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
        {
            _id:this._id,
            // refresh token having less data than access tokens 
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)


/*

// Add a custom method to the user schema to generate a JWT access token
userSchema.methods.generateAccessToken = function () {
    // We use JWT to create a secure, stateless token that contains user info
    // This token will be sent to the client after login and used for future authentication

    return jwt.sign(
        {
            _id: this._id,            // Include user ID in the token payload to identify the user
            email: this.email,        // Include email to use it in authorization if needed
            username: this.username,  // Include username for convenience (optional)
            fullname: this.fullname   // Include full name for frontend display (optional)
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key to sign the token; must be kept private
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Set token expiry (e.g., '1h', '7d') for security
        }
    );

    // Why we do this:
    // - To keep user logged in without storing sessions on the server (stateless auth)
    // - So the token can be sent with future requests to authenticate the user
    // - Signing the token ensures its integrity and prevents tampering
    // - Storing this method in the schema keeps code organized and reusable

    // We use refresh tokens to extend user sessions securely
// - Access tokens are short-lived for security
// - Refresh tokens are long-lived and used to get new access tokens
// - This prevents users from being logged out frequently
// - And also keeps our API stateless and scalable

};
*/