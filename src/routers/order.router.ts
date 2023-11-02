import { Router } from "express";
import { Order, OrderModel } from "../models/order.model";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import { OrderStatus } from "../constants/order_status";
import auth from "../middlewares/auth.mid";
import mongoose from "mongoose";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
	let orders: Order[] = [];
	orders = await OrderModel.find({});
	res.send(orders);
});

router.post("/create", async (req: any, res: any) => {
	const requestOrder = req.body;

	if (requestOrder.items.length <= 0) {
		res.status(HTTP_BAD_REQUEST).send("Cart Is Empty!");
		return;
	}

	await OrderModel.deleteOne({
		user: req.user.id,
		status: OrderStatus.NEW,
	});

	const newOrder = new OrderModel({ ...requestOrder, user: req.user.id });
	await newOrder.save();
	res.send(newOrder);
});

router.get("/track/:id", async (req, res) => {
	const order = await OrderModel.findById(req.params.id);
	res.send(order);
});

router.post("/pay", async (req: any, res) => {
	const { paymentId } = req.body;
	const order = await getNewOrderForCurrentUser(req);
	if (!order) {
		res.status(HTTP_BAD_REQUEST).send("Order Not Found!");
		return;
	}

	order.paymentId = paymentId;
	order.status = OrderStatus.PAYED;
	await order.save();

	res.send(order._id);
});

// router.get("/newOrderForCurrentUser", async (req: any, res) => {
//   const order = await getNewOrderForCurrentUser(req);
//   if (order) res.send(order);
//   else res.status(HTTP_BAD_REQUEST).send();
// });

router.get("/listOrder", async (req: any, res) => {
	const list = await OrderModel.find({ user: req.user.id });
	res.send(list);
});

// Customer order
router.post("/listOrderCust", async (req: any, res) => {
	const id = new mongoose.Types.ObjectId(req.body.id);
	console.log(id);
	const list = await OrderModel.find({ user: id });
	console.log(list);
	res.send(list);
});

async function getNewOrderForCurrentUser(req: any) {
	return await OrderModel.findOne({
		user: req.user.id,
		status: OrderStatus.NEW,
	});
}

export default router;
