const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// GET /dishes
function list(req, res) {
  res.json({ data: dishes });
}

// POST /dishes
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  // components of new dish being added
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  // add the newDish
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

// validate dishBody
function dishBody(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  // check if no name or empty
  if (!name || name === "") {
    return next({ status: 400, message: "Dish must include a name" });
  }
  // check if no description or empty
  if (!description || description === "") {
    return next({ status: 400, message: "Dish must include a description" });
  }
  // check if no price
  if (!price) {
    return next({ status: 400, message: "Dish must include a price" });
  }
  // check if price is bigger than 0
  if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  // check if url missing or empty
  if (!image_url || image_url === "") {
    return next({ status: 400, message: "Dish must include a image_url" });
  }
  next();
}

// GET /dishes/:dishId
function read(req, res) {
  res.json({ data: res.locals.dish });
}

// check if id === :dishId
function dishExist(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id does not exist: ${dishId}`,
  });
}

// PUT /dishes/:dishId
function update(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  res.locals.dish = {
    id: res.locals.dishId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  res.json({ data: res.locals.dish });
};

// check if :dishId does not exist or id in the body does not match :dishId in the route
function dishIdValidation(req, res, next) {
  const { dishId } = req.params;
	const { data: { id } = {} } = req.body;
	if(!id || id === dishId) {
		res.locals.dishId = dishId;
		return next();
	}
	next({
		status: 400,
		message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
	});
};

module.exports = {
  list,
  create: [dishBody, create],
  read: [dishExist, read],
  update: [dishExist, dishBody, dishIdValidation, update],
};