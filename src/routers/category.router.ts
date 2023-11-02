import { Router } from "express";
const sample_category = require("../assets/data/category");
import { CategoryModel } from "../models/category.model";
import { ProductModel } from "../models/product.model";

const router = Router();

router.get("/seed", async (req, res) => {
  const productCount = await CategoryModel.countDocuments();
  if (productCount > 0) {
    res.send("Seed is already done!");
    return;
  }
  await CategoryModel.create(sample_category);
  res.send("Seed is done <3");
});

// Tất cả category
router.get("/", async (req, res) => {
  const data = await CategoryModel.find();
  res.send(data);
});

// Lấy ra category theo id
router.get("/id/:id", async (req, res) => {
  const id = req.params["id"];
  const data = await CategoryModel.find({ categoryId: id });
  res.send(data);
});

// Brands theo từng category
router.get("/brands-by-category", async (req, res) => {
  try {
    const results = await ProductModel.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "categoryId",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$categoryId",
          category: { $first: "$category.categoryName" },
          brands: { $addToSet: "$productBrand" },
        },
      },
      {
        $unwind: "$brands",
      },
      {
        $sort: { brands: 1 },
      },
      {
        $group: {
          _id: "$_id",
          category: { $first: "$category" },
          brands: { $push: "$brands" },
        },
      },
    ]);

    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server error" });
  }
});

// Trả về danh sách sản phẩm theo categoryName
// Ví dụ theo laptop, theo phone
router.get("/:categoryName", async (req, res) => {
  const categoryName = req.params["categoryName"];
  const category = await CategoryModel.findOne({
    categoryName: categoryName,
  });

  if (category) {
    const categoryId = category.categoryId;
    const data = await ProductModel.find({
      categoryId: categoryId,
      deletedAt: null,
    });
    res.send(data);
  } else {
    res.status(404).json({ message: "Category not found" });
  }
});

//Trả về danh sách theo categoryName và brand
// ví dụ /laptop/asus --> laptop của brand asus
router.get("/:categoryName/:brand", async (req, res) => {
  const categoryName = req.params["categoryName"];
  const brand = req.params["brand"];
  const category = await CategoryModel.findOne({
    categoryName: categoryName,
  });
  if (category) {
    const categoryId = category.categoryId;
    const data = await ProductModel.find({
      categoryId: categoryId,
      deletedAt: null,
      productBrand: { $regex: new RegExp(brand, "i") },
    });
    res.send(data);
  } else {
    res.status(404).json({ message: "Category not found" });
  }
});

export default router;
