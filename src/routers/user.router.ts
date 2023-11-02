import { Router } from "express";
import { User, UserModel } from "../models/user.model";
import { Product } from "../models/product.model";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Cart } from "../models/cart.model";
import mongoose, { ObjectId } from "mongoose";
import auth from "../middlewares/auth.mid";

const nodemailer = require("nodemailer");

const router = Router();

router.get("/seed", async (req, res) => {
  const { name, email, password, address } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: "",
    name,
    email: email.toLowerCase(),
    password: encryptedPassword,
    address,
    isAdmin: false,
    cart: new Cart(),
  };
  const dbUser = await UserModel.create(newUser);
  res.send(generateTokenReponse(dbUser));
});

router.post("/save-cart", async (req, res) => {
  const idUser = req.body.id;
  const cartUser = req.body.cart;
  const idObject = new mongoose.Types.ObjectId(idUser);

  const result = await UserModel.findByIdAndUpdate(idObject, {
    cart: cartUser,
  });
  res.send(result);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.send(generateTokenReponse(user));
  } else {
    res.send("Username or password is invalid!");
  }
});

router.post("/register", async (req, res) => {
  const { name, email, password, address } = req.body;
  const user = await UserModel.findOne({ email });
  if (user) {
    res.status(HTTP_BAD_REQUEST).send("User is already exist, please login!");
    return;
  }

  const encryptedPassword = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: "",
    name,
    email: email.toLowerCase(),
    password: encryptedPassword,
    address,
    isAdmin: false,
    cart: new Cart(),
  };

  const dbUser = await UserModel.create(newUser);
  res.send(generateTokenReponse(dbUser));
});

// Forget password
router.put("/forget-password", async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    res.json("Không tồn tại địa chỉ email! \n Vui lòng kiểm tra lại");
  } else {
    const newPass = Math.floor(Math.random() * 900000) + 100000;
    const encryptedPassword = await bcrypt.hash(newPass.toString(), 10);
    user.password = encryptedPassword;
    await user.save();

    // gửi mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "[BlueSpace] Yêu cầu Quên mật khẩu",
      text: `Mật khẩu mới của bạn là: ${newPass}\n Trân trọng `,
    };

    transporter.sendMail(mailOptions, function (error: any, info: any) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json(
      "Mật khẩu mới đã được gửi về mail của bạn !\n Vui lòng kiểm tra mục spam nếu không thấy thư"
    );
  }
});

// Lấy user khác admin
router.get("/get-users", auth, async (req, res) => {
  const result = await UserModel.find({ isAdmin: false });

  res.send(result);
});

// Lấy user by id
router.get("/get-user/:id", auth, async (req, res) => {
  const id = req.params["id"];

  const result = await UserModel.findOne({ _id: id });

  res.send(result);
});

router.put("/change-password", auth, async (req: any, res) => {
  const { newPassword, currentPassword } = req.body;

  const userchange = await UserModel.findOne({ email: req.user.email });

  if (!userchange) {
    return res.json("User not found");
  }

  // kiểm tra mật khẩu hiện tại
  const isMatch = await bcrypt.compare(currentPassword, userchange.password);

  if (!isMatch) {
    return res.json("Sai mật khẩu");
  }

  // đổi mật khẩu\

  const encryptedPassword = await bcrypt.hash(newPassword, 10);
  userchange.password = encryptedPassword;
  await userchange.save();
  res.json("Đổi mật khẩu thành công. Mời đăng nhập lại!");
});

// Update Account
router.put("/user/update", auth, async (req: any, res) => {
  const { newName, newAddress } = req.body;

  const userchange = await UserModel.findOne({ email: req.user.email });
  if (!userchange) {
    return res.json("User not found");
  }
  userchange.name = newName;
  userchange.address = newAddress;
  await userchange.save();
  console.log(userchange.name);
  res.send(generateTokenReponse(userchange));
});

const generateTokenReponse = (user: User) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "30d",
    }
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    cart: user.cart,
    token: token,
  };
};

export default router;
