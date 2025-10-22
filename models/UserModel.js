// Import mongoose library for MongoDB object modeling
import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt"
// Define the User schema structure for the database
const userSchema = new mongoose.Schema({
    // User's email address - unique identifier for login
    email: {
        type: String,                           // Data type: String
        required: [true, "Email is Required"],  // Required field with custom error message
        unique: true,                           // Ensures no duplicate emails in database
    },
    
    // User's password - stored as hashed string
    password: {
        type: String,                               // Data type: String
        required: [true, "Password is Required"],   // Required field with custom error message
        // minlength: [6, "Password must be at least 6 characters"], // Optional: minimum password length
    },
    
    // User's first name - for profile display
    firstName: {
        type: String,       // Data type: String
        required: false,    // Optional field - user can set later
    },
    
    // User's last name - for profile display  
    lastName: {
        type: String,       // Data type: String
        required: false,    // Optional field - user can set later
    },
    
    // Profile picture - stores image URL or file path
    image: {
        type: String,       // Data type: String (URL/path to image)
        required: false,    // Optional field - user can upload later
    },
    
    // Profile color theme - for UI personalization
    color: {
        type: Number,       // Data type: Number (represents color code/index)
        required: false,    // Optional field - user can choose later
    },
    
    // Profile completion status - tracks if user finished setup
    profileSetup: {
        type: Boolean,      // Data type: Boolean (true/false)
        default: false,     // Default value: false (profile not setup initially)
    },
});
//encrypting the password before saving to db
userSchema.pre("save",async function(next){
    const salt=await genSalt();
    this.password=await hash(this.password,salt);
    next();
})


const User=mongoose.model("Users",userSchema);

export default User;
