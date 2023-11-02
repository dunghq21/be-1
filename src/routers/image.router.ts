import { Router } from "express";
import { data } from "../assets/data/aboutus";
import { address } from "../assets/data/address";

import fileUpload, { UploadedFile } from "express-fileupload";
import * as fs from "fs";
const path = require("path");

const router = Router();

// Trả về hình ảnh của từng sản phẩm theo productId
router.get("/products/:productId/:imageName", (req, res) => {
	const productId = req.params["productId"];
	const imageName = req.params["imageName"];
	const pathProductsImages = path.join(
		__dirname,
		"..",
		"assets",
		"images",
		"products"
	);

	res.sendFile(pathProductsImages + "/" + productId + "/" + imageName);
});

// Trả về hình ảnh theo tên trong folder temp
router.get("/temp/:nameImage", (req, res) => {
	const nameImage = req.params["nameImage"];
	const pathTempImages = path.join(__dirname, "..", "assets", "images");

	res.sendFile(pathTempImages + "/temp/" + nameImage);
});

// Post ảnh vào temp
router.post("/upload-temp", (req, res) => {
	console.log("vào upload temp");
	const pathTempImages = path.join(__dirname, "..", "assets", "images");

	const reqFile = req.files;
	if (reqFile != null) {
		let images = reqFile.files;
		// console.log(images);
		if (!req.files) return res.sendStatus(400);

		if (!images) return res.sendStatus(400);

		if (Array.isArray(images) == false) {
			// Trường hợp chỉ truyền vào 1 ảnh
			// Thì nó là object
			images = images as UploadedFile;
			console.log(images);
			images.mv(pathTempImages + "/temp/" + images.name);
			console.log("upload file thành công");
		} else {
			// Trường hợp chỉ truyền vào nhiều ảnh
			// Thì nó là array
			images = images as UploadedFile[];
			console.log(images);
			for (let i = 0; i < images.length; i++) {
				images[i].mv(pathTempImages + "/temp/" + images[i].name);
				console.log("upload file thành công");
			}
		}
		// all good
		res.send(true);
	}
});

// Xóa tất cả ảnh ở thực mục temp
router.delete("/delete-temp", (req, res) => {
	console.log("vào delete temp");
	const pathTempImages = path.join(__dirname, "..", "assets", "images");
	const tempPath = pathTempImages + "/temp";

	fs.readdir(tempPath, (err, files) => {
		if (err) throw err;

		for (const file of files) {
			fs.unlink(path.join(tempPath, file), (err) => {
				if (err) throw err;
			});
		}
	});
	res.send(true);
});

// Xóa ảnh theo id (xóa sản phẩm)
router.delete("/delete/:productID", (req, res) => {
	const productID = req.params["productID"];
	const pathProductImages = path.join(
		__dirname,
		"..",
		"assets",
		"images",
		"products",
		productID
	);
	fs.readdir(pathProductImages, (err, files) => {
		if (err) throw err;

		for (const file of files) {
			fs.unlink(path.join(pathProductImages, file), (err) => {
				if (err) throw err;
			});
		}
	});

	fs.rm(pathProductImages, { recursive: true }, (err) => {
		if (err) {
			console.error(`Error while deleting folder ${pathProductImages}:`, err);
		} else {
			console.log(`Folder ${pathProductImages} deleted successfully!`);
		}
	});
	res.send(true);
});

// Post hình vào folder theo productId
router.post("/upload/:productId", (req, res) => {
	console.log("Vào up hình cho product");
	const productId = req.params.productId;

	const pathProductsImages = path.join(
		__dirname,
		"..",
		"assets",
		"images",
		"products"
	);

	const pathTempImages = path.join(__dirname, "..", "assets", "images", "temp");

	fs.mkdir(pathProductsImages + "/" + productId, { recursive: true }, (err) => {
		if (err) throw err;
		console.log("Folder created!");
	});

	// Đọc danh sách các file trong thư mục temp
	fs.readdir(pathTempImages, (err, files) => {
		if (err) {
			console.error("Lỗi khi đọc thư mục temp:", err);
			return;
		}

		// Lặp qua từng file trong thư mục temp
		files.forEach((file) => {
			const tempFilePath = path.join(pathTempImages, file);
			const targetFilePath = path.join(pathProductsImages, productId, file);

			// Di chuyển file từ thư mục temp sang thư mục products
			fs.rename(tempFilePath, targetFilePath, (err) => {
				if (err) {
					console.error(`Lỗi khi di chuyển file ${file}:`, err);
				} else {
					console.log(`Đã di chuyển file ${file} thành công!`);
				}
			});
		});
	});

	//all good
	res.send(true);
});

router.get("/about-us", async (req, res) => {
	res.send(data);
});
router.get("/address", async (req, res) => {
	res.send(address);
});

export default router;
