import { Router } from "express";
import { Product, ProductModel } from "../models/product.model";
import { CategoryModel } from "../models/category.model";
import mongoose from "mongoose";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
const sample_products = require("../assets/data/products");

const router = Router();

// Import data to DB
router.get("/seed", async (req, res) => {
	const productCount = await ProductModel.countDocuments();
	if (productCount > 0) {
		res.send("Seed is already done!");
		return;
	}
	await ProductModel.create(sample_products);

	res.send("Seed is done, Lam");
});

// Get all products
router.get("/", async (req, res) => {
	const data = await ProductModel.find({ deletedAt: null });
	res.send(data);
});
// Get all deleted products
router.get("/deletedProduct", async (req, res) => {
	const data = await ProductModel.find({ deletedAt: { $ne: null } });
	res.send(data);
});

// Create new product
router.post("/new", async (req, res) => {
	const newProduct = req.body;
	await ProductModel.create(newProduct);

	res.send(newProduct);
});

// update sản phẩm
router.put("/update", async (req, res) => {
	const id = req.body.id;
	const idObject = new mongoose.Types.ObjectId(id);

	const result = await ProductModel.findByIdAndUpdate(idObject, req.body);

	res.send(result);
});

// Delete product by id
router.delete("/delete/:id", async (req, res) => {
	console.log("vào delete sản phẩm");
	const id = req.params["id"];
	const idObject = new mongoose.Types.ObjectId(id);
	const now = Date.now();
	const result = await ProductModel.updateOne(
		{ _id: idObject },
		{ deletedAt: now }
	);

	//   const result = await ProductModel.updateOne(idObject);

	res.send(result);
});

// Delete product by id
router.delete("/permanentDelete/:id", async (req, res) => {
	console.log("vào delete sản phẩm");
	const id = req.params["id"];
	const idObject = new mongoose.Types.ObjectId(id);
	const now = Date.now();
	const result = await ProductModel.findOneAndDelete({ _id: idObject });

	//   const result = await ProductModel.updateOne(idObject);

	res.send(result);
});

router.put("/restore", async (req, res) => {
	const id = req.body.id;
	const idObject = new mongoose.Types.ObjectId(id);
	const now = Date.now();
	const result = await ProductModel.updateOne(
		{ _id: idObject },
		{ deletedAt: null }
	);

	//   const result = await ProductModel.updateOne(idObject);

	res.send(result);
});

// Lấy sản phẩm theo brand
router.get("/brand/:brand", async (req, res) => {
	const brand = req.params["brand"];

	const data = await ProductModel.find({
		productBrand: { $regex: new RegExp(brand, "i") },
		deletedAt: null,
	});

	res.send(data);
});

// Search sản phẩm theo name
router.get("/search/:searchTerm", async (req, res) => {
	const searchTerm = req.params.searchTerm;
	const regex = new RegExp(searchTerm, "i");
	const products = await ProductModel.find({
		productName: { $regex: regex },
		deletedAt: null,
	});
	res.send(products);
});

// Search sản phẩm theo name nhưng thuộc category
router.get("/search/:categoryName/:searchTerm", async (req, res) => {
	const searchTerm = req.params.searchTerm;
	const regex = new RegExp(searchTerm, "i");
	const categoryName = req.params["categoryName"];

	const category = await CategoryModel.findOne({ categoryName });

	if (category) {
		const categoryId = category.categoryId;

		let products = await ProductModel.find({
			categoryId: categoryId,
			productName: { $regex: regex },
			deletedAt: null,
		});

		res.send(products);
	}
});
// Product by Tag
router.get("/tag/:tag", async (req, res) => {
	const tag = req.params.tag;
	const filteredProducts = await ProductModel.find({
		productTags: tag,
		deletedAt: null,
	});
	res.json(filteredProducts);
});

// Product by id
router.get("/id/:id", async (req, res) => {
	let id = req.params.id;
	//   const obID = new mongoose.Types.ObjectId(id);
	const data = await ProductModel.find({ _id: id, deletedAt: null });
	if (data.length > 0) res.send(data[0]);
	else res.status(HTTP_BAD_REQUEST).send("Không tìm thấy sản phẩm");
});

// Sản phẩm nổi bật
router.get("/topDiscount/:categoryName", async (req, res) => {
	try {
		const categoryName = req.params.categoryName;
		const category = await CategoryModel.findOne({
			categoryName: categoryName,
		});
		if (!category) {
			const products = await ProductModel.find({ deletedAt: null })
				.sort({ productDiscount: -1 })
				.limit(5);
			res.json(products);
		} else {
			const products = await ProductModel.find({
				categoryId: category.categoryId,
				deletedAt: null,
			})
				.sort({ productDiscount: -1 })
				.limit(5);
			res.json(products);
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
});

// Lấy 2 sản phẩm so sánh
router.get("/compare/:id1/:id2", async (req, res) => {
	try {
		const product1 = await ProductModel.findById(req.params.id1);
		const product2 = await ProductModel.findById(req.params.id2);

		if (!product1 || !product2) {
			return res.status(404).json({ message: "Product not found" });
		}

		res.json([product1, product2]);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Server error" });
	}
});
// Lấy sản phẩm combo
router.get("/combo-product/:id", async (req, res) => {
	try {
		// Find the product by id
		const product = await ProductModel.findById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		// Find 3 random products with different categoryId
		let randomProducts: Product[] = [];

		randomProducts = await ProductModel.aggregate([
			{ $match: { categoryId: { $ne: product.categoryId }, deletedAt: null } },
			{ $sample: { size: 3 } },
			{
				$project: {
					id: "$_id",
					productName: 1,
					productID: 1,
					categoryId: 1,
					productPrice: 1,
					productDiscount: 1,
					productImage: 1,
					productBrand: 1,
					productRegion: 1,
					ratingPoint: 1,
					numberReview: 1,
					warrantyPeriod: 1,
					description: 1,
					productTags: 1,
					specifications: 1,
					deletedAt: 1,
				},
			},
		]);

		res.send(randomProducts);
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Server error" });
	}
});

// filter cho all product
router.post("/filter", async (req, res) => {
	const brand = req.body.brand;
	const price = req.body.price;

	let products = await ProductModel.find({
		productBrand: {
			$regex: new RegExp(brand.join("|"), "i"),
		},
		deletedAt: null,
	});

	if (price) {
		const [min, max] = price.split("-").map(Number);
		products = products.filter((product) => {
			let productPrice = product.productPrice;
			let productDiscount = product.productDiscount;
			let newPrice = 0;
			if (productDiscount) {
				newPrice = productPrice - (productPrice * productDiscount) / 100;
			}
			return newPrice > min * 1000000 && newPrice < max * 1000000;
		});
	}
	res.send(products);
});

// Filter sản phẩm theo chức năng
router.post("/filter/:categoryName", async (req, res) => {
	const categoryName = req.params["categoryName"];

	if (categoryName == "laptop") {
		const screen = req.body.screen;
		const brand = req.body.brand;
		const ram = req.body.ram;
		const price = req.body.price;

		const category = await CategoryModel.findOne({
			categoryName: categoryName,
		});

		if (category) {
			const categoryId = category.categoryId;

			let products = await ProductModel.find({
				categoryId: categoryId,
				deletedAt: null,
				productBrand: {
					$regex: new RegExp(brand.join("|"), "i"),
				},
				"specifications.screen": {
					$regex: new RegExp(screen.join("|"), "i"),
				},
				"specifications.ram": {
					$regex: new RegExp(ram.join("|"), "i"),
				},
			});

			if (price) {
				const [min, max] = price.split("-").map(Number);
				products = products.filter((product) => {
					let productPrice = product.productPrice;
					let productDiscount = product.productDiscount;
					let newPrice = 0;
					if (productDiscount) {
						newPrice = productPrice - (productPrice * productDiscount) / 100;
					}
					return newPrice > min * 1000000 && newPrice < max * 1000000;
				});
			}
			res.send(products);
		}
	}

	// Filter của phone
	if (categoryName == "phone" || categoryName == "tablet") {
		const storage = req.body.storage;
		const brand = req.body.brand;
		const ram = req.body.ram;
		const price = req.body.price;

		const category = await CategoryModel.findOne({
			categoryName: categoryName,
		});

		if (category) {
			const categoryId = category.categoryId;

			let products = await ProductModel.find({
				categoryId: categoryId,
				deletedAt: null,
				productBrand: {
					$regex: new RegExp(brand.join("|"), "i"),
				},
				"specifications.storage": {
					$regex: new RegExp(storage.join("|"), "i"),
				},
				"specifications.ram": {
					$regex: new RegExp(ram.join("|"), "i"),
				},
			});

			if (price) {
				const [min, max] = price.split("-").map(Number);
				products = products.filter((product) => {
					let productPrice = product.productPrice;
					let productDiscount = product.productDiscount;
					let newPrice = 0;
					if (productDiscount) {
						newPrice = productPrice - (productPrice * productDiscount) / 100;
					}

					return newPrice > min * 1000000 && newPrice < max * 1000000;
				});
			}
			res.send(products);
		}
	}

	// Filter của earphone và keyboard
	if (categoryName == "earphone" || categoryName == "keyboard") {
		const brand = req.body.brand;
		const type = req.body.type;
		const connection = req.body.connection; // dây, bluetooth --> nếu keyboard
		const price = req.body.price;

		const category = await CategoryModel.findOne({
			categoryName: categoryName,
		});

		if (category) {
			const categoryId = category.categoryId;

			let products = await ProductModel.find({
				categoryId: categoryId,
				deletedAt: null,
				productBrand: {
					$regex: new RegExp(brand.join("|"), "i"),
				},
				"specifications.type": {
					$regex: new RegExp(type.join("|"), "i"),
				},
				"specifications.connection": {
					$regex: new RegExp(connection.join("|"), "i"),
				},
			});

			if (price) {
				const [min, max] = price.split("-").map(Number);
				products = products.filter((product) => {
					let productPrice = product.productPrice;
					let productDiscount = product.productDiscount;
					let newPrice = 0;
					if (productDiscount) {
						newPrice = productPrice - (productPrice * productDiscount) / 100;
					}
					return newPrice > min * 1000000 && newPrice < max * 1000000;
				});
			}

			res.send(products);
		}
	}

	// Filter của mouse
	if (categoryName == "mouse") {
		const brand = req.body.brand;
		const price = req.body.price;

		const category = await CategoryModel.findOne({
			categoryName: categoryName,
		});

		if (category) {
			const categoryId = category.categoryId;

			let products = await ProductModel.find({
				categoryId: categoryId,
				deletedAt: null,
				productBrand: {
					$regex: new RegExp(brand.join("|"), "i"),
				},
			});

			if (price) {
				const [min, max] = price.split("-").map(Number);
				products = products.filter((product) => {
					let productPrice = product.productPrice;
					let productDiscount = product.productDiscount;
					let newPrice = 0;
					if (productDiscount) {
						newPrice = productPrice - (productPrice * productDiscount) / 100;
					}
					return newPrice > min * 1000000 && newPrice < max * 1000000;
				});
			}
			res.send(products);
		}
	}

	// Filter của application
	if (categoryName == "application") {
		const brand = req.body.brand; // Microsoft
		const type = req.body.type; // Diệt virus
		const language = req.body.language;
		const price = req.body.price;

		const category = await CategoryModel.findOne({
			categoryName: categoryName,
			deletedAt: null,
		});

		if (category) {
			const categoryId = category.categoryId;

			let products = await ProductModel.find({
				categoryId: categoryId,
				deletedAt: null,
				productBrand: {
					$regex: new RegExp(brand.join("|"), "i"),
				},
				"specifications.type": {
					$regex: new RegExp(type.join("|"), "i"),
				},
				"specifications.language": {
					$regex: new RegExp(language.join("|"), "i"),
				},
			});

			if (price) {
				const [min, max] = price.split("-").map(Number);
				products = products.filter((product) => {
					let productPrice = product.productPrice;
					let productDiscount = product.productDiscount;
					let newPrice = 0;
					if (productDiscount) {
						newPrice = productPrice - (productPrice * productDiscount) / 100;
					}
					return newPrice > min * 1000000 && newPrice < max * 1000000;
				});
			}
			res.send(products);
		}
	}
});

// sort sản phẩm với tất cả sản phẩm
router.get("/sort/:sortType", async (req, res) => {
	const sortType = req.params["sortType"];

	let data = await ProductModel.find({ deletedAt: null });

	const result = data.sort((a: Product, b: Product) => {
		if (sortType == "asc") {
			return a.productPrice - b.productPrice;
		} else {
			return b.productPrice - a.productPrice;
		}
	});

	res.send(result);
});

// sort sản phẩm theo tăng dần, giảm dần với sp cho trước
router.post("/sort/:sortType", (req, res) => {
	const sortType = req.params["sortType"];
	let result = req.body;

	const data = result.sort((a: Product, b: Product) => {
		// Lỗi khi so sánh giá mới
		/*
		let newPriceA = 0;
		if (a.productDiscount) {
			newPriceA = a.productPrice - (a.productPrice * a.productDiscount) / 100;
		}
		let newPriceB = 0;
		if (b.productDiscount) {
			newPriceB = a.productPrice - (a.productPrice * b.productDiscount) / 100;
		}

		if (sortType == "asc") {
			return newPriceA - newPriceB;
		} else {
			return newPriceB - newPriceA;
		}
		*/
		// So sánh với giá mới bị lỗi nên so sánh qua giá thường
		if (sortType == "asc") {
			return a.productPrice - b.productPrice;
		} else {
			return b.productPrice - a.productPrice;
		}
	});

	res.send(data);
});

// Lấy top sales theo categoryName
router.get("/top-sales/:categoryName", async (req, res) => {
	const categoryName = req.params.categoryName;

	const category = await CategoryModel.findOne({ categoryName });
	if (category) {
		const categoryId = category.categoryId;

		const products = await ProductModel.aggregate([
			{
				$match: {
					categoryId: categoryId,
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
				$project: {
					_id: 1,
					productName: 1,
					ratingPoint: 1,
					numberReview: 1,
					categoryName: "$category.categoryName",
				},
			},
			{
				$unwind: "$categoryName",
			},
			{
				$sort: { ratingPoint: -1, numberReview: -1 },
			},
			{
				$limit: 4,
			},
		]);

		res.send(products);
	} else res.send("Not found!");
});

export default router;
