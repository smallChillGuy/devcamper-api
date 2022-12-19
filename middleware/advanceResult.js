const advanceResults = (model, populate) => async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Remove fields from query
  removeFields.forEach(param => delete reqQuery[param])

  // Create query string
  let querySrt = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, ....)
  querySrt = querySrt
    .replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = model.find(JSON.parse(querySrt));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.replace(/,/g, ' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.replace(/,/g, ' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // if populate has been passed, we populate the query
  if (populate) {
    query.populate(populate);
  }
  
  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};

  if(endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page -1,
      limit
    };
  }
  res.advanceResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};


module.exports = advanceResults;
