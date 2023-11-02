// Database
import * as dotenv from "dotenv";
dotenv.config();

import { dbConnect } from "./src/configs/database.config";
dbConnect();

import express from "express";
import cors from "cors";
import productRouter from "./src/routers/product.router";
import userRouter from "./src/routers/user.router";
import categoryRouter from "./src/routers/category.router";
import imageRouter from "./src/routers/image.router";
import orderRouter from "./src/routers/order.router";
import bodyParser from "body-parser";

import fileUpload from "express-fileupload";

const app = express();
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5001", "http://localhost:5002"],
  })
);

app.use(
  fileUpload({
    limits: {
      fieldSize: 10000000,
    },
    abortOnLimit: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello Server");
});

// Router
app.use("/product", productRouter);
app.use("/category", categoryRouter);
app.use("/auth", userRouter);
app.use("/images", imageRouter);
app.use("/orders", orderRouter);

// Running port
const port = 5000;
app.listen(port, () => {
  console.log("Webserver running at http://localhost:" + port);
});
