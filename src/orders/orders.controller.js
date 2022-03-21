const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// GET /orders/:orderId
function list(req, res) {
  res.json({ data: orders });
};

// POST /orders
function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  // components of new order being added
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status ? status : "pending",
    dishes: dishes,
  };
  // add new order to the orders
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

// validate orderBody
function orderBody(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  // check if deliverTo property is missing or missing
  if (!deliverTo || deliverTo === "") {
    return next({ status: 400, message: "Order must include a deliverTo" });
  }
  // check if mobileNumber property is missing or empty
  if (!mobileNumber || mobileNumber === "") {
    return next({ status: 400, message: "Order must include a mobileNumber" });
  }
  // check if dishes property is missing
  if (!dishes) {
    return next({ status: 400, message: "Order must include at least one dish" });
  }
  // check if dishes property is not an array or empty
  if (!Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  // check if a dish quantity property is missing, zero or less, or not an integer
  dishes.map((dish, index) => {
    if (
        !dish.quantity ||
        !Number.isInteger(dish.quantity) ||
        !dish.quantity > 0
      ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0.`,
      });
    }
  });
  res.locals.order = req.body.data;
  next();
}

// GET /orders/:orderId
function read(req, res) {
	res.json({ data: res.locals.order });
}

// check if id === :orderId
function orderExist(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id does not exist: ${orderId}`,
  });
}

// PUT /orders/:orderId
function update(req, res) {
  const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
  res.locals.order = {
   id: res.locals.order.id,
    deliverTo: deliverTo,
		mobileNumber: mobileNumber,
		dishes: dishes,
		status: status,
  };
  res.json({ data: res.locals.order });
};

// validate status
function statusCheck(req, res, next) {
  const { orderId } = req.params;
	const { data: { id, status } = {} } = req.body;
  // check if id of body does not match :orderId from the route
	if(id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    })
  }
  // check if status property is missing ot empty and if not pending preparing or out for delivery
	else if(!status || status === "" || (status !== "pending" && status !== "preparing" && status !== "out-for-delivery")) {
    return next({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    })
  }		
  // check if status property of the existing order === "delivered
	else if(status === "delivered"){
    return next({
      status: 400,
      message: "A delivered order cannot be changed"
    })
  }
	next();
};

// DELETE /orders/:orderId
function destroy(req, res) {
  const index = orders.indexOf(res.locals.order);
	orders.splice(index, 1);
	res.sendStatus(204);
}

// validate destroy
function destroyCheck(req, res, next) {
  // check if status property of the order !== "pending"
  if(res.locals.order.status !== "pending") {
		return next({
			status: 400,
			message: "An order cannot be deleted unless it is pending",
		});
	}
	next();
}


module.exports = {
  list,
  create: [orderBody, create],
  read: [orderExist, read],
  update: [orderBody, orderExist, statusCheck, update],
  delete: [orderExist, destroyCheck, destroy],
}