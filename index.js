//console.log("Hello, World!");

// import express from 'express';

// let app = express();

// function successFullyStarted() {
//     console.log("Server is running on port 3000");
// }

// app.listen(3000, successFullyStarted);

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
// import Student from "./models/student.js"; // Importing the Student model
// import studentRouter from "./routes/studentRouter.js";
import productRouter from "./routes/productRouter.js";
import userRouter from "./routes/useroute.js";
import brandRouter from "./routes/brandRouter.js";
import paymentRouter from "./routes/paymentRoutes.js";
import jwt from "jsonwebtoken";
import orderRouter from "./routes/orderRoute.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json()); // This must code before other functions

app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");
    
    try {
      // Use synchronous verify instead of callback
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.user = decoded;
      next();
    } catch (err) {
      console.log("Invalid token:", err.message);
      // Don't send response here - let the route handler decide
      // Some routes might not require auth
      next();
    }
  } else {
    // No token provided - continue to route
    next();
  }
});

//database connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to the Database!");
  })
  .catch(() => {
    console.log("Failed to connect to the Database!");
  });

//-----------------------

// app.use("/students", studentRouter); // Using the studentRouter for /students endpoint
// Mount API routes under /api to match frontend expectations
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/brands", brandRouter);
app.use("/api/payment", paymentRouter);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
 