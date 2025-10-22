// Controller for auth-related endpoints: signup, login, getUserInfo, updateProfile, profile image
// Relies on JWT cookie (httpOnly) for session; User is a Mongoose model

// Import User model for database operations
import User from "../models/UserModel.js";
// Import JWT sign function for creating authentication tokens
import jwt from "jsonwebtoken";
import { compare} from "bcrypt";
import {renameSync,unlinkSync} from "fs"
// Token expiration time: 3 days in milliseconds (3 * 24 * 60 * 60 * 1000)
const maxAge = 3 * 24 * 60 * 60 * 1000;


const createToken = (email, userId) => {
    return jwt.sign(
        { email, userId },              // Payload: user data to include in token
        process.env.JWT_KEY,            // Secret key for signing token (from .env)
        { expiresIn: maxAge }           // Token expires after 3 days
    );
};


export const signup = async (request, response, next) => {
    try {
        // Extract email and password from request body
        const { email, password } = request.body;
        
        // Validate required fields - both email and password must be provided
        if (!email || !password) {
            return response.status(400).send("Email and Password is required");
        }
        
        // Create new user in database with provided email and password
        const user = await User.create({ email, password });
        
        // Set JWT token as HTTP-only cookie for secure authentication
        response.cookie("jwt", createToken(email, user.id), {
            maxAge,                     // Cookie expires after 3 days
            secure: true,               // Cookie only sent over HTTPS
            sameSite: "None",           // Allow cross-site requests (for frontend-backend communication)
        });
        // Send success response with user data
        return response.status(201).json({ 
           user:{
            id:user.id,                    // User's unique database ID
            email:user.email,              // User's email address
            profileSetup:user.profileSetup, // Profile completion status
           },
        });
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response to client
        return response.status(500).send("Internal Server Error");
    }
};

export const login=async (request, response, next) => {
    try {
        // Extract email and password from request body
        const { email, password } = request.body;
        
        // Validate required fields - both email and password must be provided
        if (!email || !password) {
            return response.status(400).send("Email and Password is required");
        }
        
        // Create new user in database with provided email and password
        const user = await User.findOne({ email });
        if(!user){
            return response.status(404).send("User with given email not found")
        }
        const auth=await compare(password,user.password);
        if(!auth){
            return response.status(400).send("Incorrect password");
        }
        // Set JWT token as HTTP-only cookie for secure authentication
        response.cookie("jwt", createToken(email, user.id), {
            maxAge,                     // Cookie expires after 3 days
            secure: true,               // Cookie only sent over HTTPS
            sameSite: "None",           // Allow cross-site requests (for frontend-backend communication)
        });
        // Send success response with user data
        return response.status(200).json({ 
           user:{
            id:user.id,                    // User's unique database ID
            email:user.email,              // User's email address
            profileSetup:user.profileSetup, // Profile completion status
            firstName:user.firstName,
            lastName:user.lastName,
            image:user.image,
            color:user.color,
           },
        });
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response to client
        return response.status(500).send("Internal Server Error");
    }
};


export const getUserInfo=async (request, response, next) => {
    try {
       const userData=await User.findById(request.userId);
       if(!userData){
        return response.status(404).send("User with the given id not found. ");
       }
      
   
        return response.status(200).json({ 
          
            id:userData.id,                    // User's unique database ID
            email:userData.email,              // User's email address
            profileSetup:userData.profileSetup, // Profile completion status
            firstName:userData.firstName,
            lastName:userData.lastName,
            image:userData.image,
            color:userData.color,
          
        });
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response to client
        return response.status(500).send("Internal Server Error");
    }
};


export const updateProfile=async (request, response, next) => {
    try {

        const { userId }=request;
        const { firstName, lastName, color}=request.body
       // validate without rejecting 0
if (!firstName || !lastName) {
  return res.status(400).json({ message: "Firstname lastname and color is required" });
}

        const userData=await User.findByIdAndUpdate(userId,{
            firstName,
            lastName,
            color,
            profileSetup:true,
        },{new:true,runValidators:true})
   
        return response.status(200).json({ 
          
            id:userData.id,                    // User's unique database ID
            email:userData.email,              // User's email address
            profileSetup:userData.profileSetup, // Profile completion status
            firstName:userData.firstName,
            lastName:userData.lastName,
            image:userData.image,
            color:userData.color,
          
        });
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response to client
        return response.status(500).send("Internal Server Error");
    }
};


export const addProfileImage=async (request, response, next) => {
    try {
        console.log(request.file);
        if(!request.file){
            return response.status(400).send("File is required")
        }
        const date=Date.now();
        // console.log(request.file.originalname);
        // console.log(request.file.path);
        let fileName="uploads/profiles/"+date+request.file.originalname;
        renameSync(request.file.path,fileName);
        // console.log(request.file.path);

        const updatedUser=await User.findByIdAndUpdate(request.userId,{image:fileName},{new:true,runValidators:true})
//   console.log(updatedUser);
   
        return response.status(200).json({ 
          
           
            image:updatedUser.image,
         
          
        });
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response to client
        return response.status(500).send("Internal Server Error");
    }
};


export const removeProfileImage=async (request, response, next) => {
    try {

       const { userId}=request;
       const user=await User.findById(userId);
       if(!user){
        return response.status(404).send("User not found");

       }
//   console.log(user.image);
       if(user.image){
        unlinkSync(user.image);
       }
       user.image=null;
       await user.save();

      
   
        return response.status(200).send("Profile image removed successfully");
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response to client
        return response.status(500).send("Internal Server Error");
    }
};


export const logout=async (request, response, next) => {
    try {

    

        console.log(request);
        response.cookie("jwt","",{maxAge:1,secure:true,sameSite:"None"});
        console.log(response);
        return response.status(200).send("Logout successful");
    } catch (error) {
        // Log error for debugging
        console.log({ error });
        // Send generic error response to client
        return response.status(500).send("Internal Server Error");
    }
};

