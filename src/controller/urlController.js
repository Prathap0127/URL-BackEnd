const jwt = require("jsonwebtoken");
const Url = require("../models/UrlModel");
const generatePassword = require("generate-password");

const ITEMS_PER_PAGE = 10;

// CREATE SHORT URL => POST: /api/url/
exports.createNewShortUrl = async (req, res, next) => {
  try {
    // console.log("createNewShortUrl \n" + JSON.stringify(req.body))   //TEST
    const { originalLink } = req.body;
    // const user_id = await jwt.verify(req.cookies.token, process.env.JWT_SECRET).id// This method is not getting cookies in render
    const user_id = await jwt.verify(req.get("token"), process.env.JWT_SECRET)
      .id;
    console.log(user_id);
    let urlData = await Url.findOne({ originalLink, createdBy: user_id });
    console.log(urlData);
    if (urlData) {
      // if Url Already Exists return the data
      return res.status(200).json(urlData);
    } else {
      // Create a new short url if url doesn't exist
      const urlCode = generatePassword.generate({
        length: 10,
        numbers: true,
        uppercase: true,
      });
      console.log({
        ...req.body,
        urlCode,
        createdBy: user_id,
      });
      const newUrlData = await Url.create({
        ...req.body,
        urlCode,
        createdBy: user_id,
      });
      console.log(newUrlData);
      return res
        .status(201)
        .send({ message: "Link Created Successfully", newUrlData });
    }
  } catch (error) {
    console.log(`Error creating short URL: ${error}`);
    res.status(500).send({ message: `Error creating short URL: ${error}` });
  }
};

// Show All Post Created by User
exports.showShortUrlsOfUser = async (req, res, next) => {
  const page = req.query.page || 1;

  console.log("Show result: Pg ", page);
  try {
    // const user_id = await jwt.verify(req.cookies.token, process.env.JWT_SECRET).id || ""; // req.cookies.token is not working in Render
    const user_id =
      (await jwt.verify(req.get("token"), process.env.JWT_SECRET).id) || "";
    console.log(user_id);
    /* jwt.verify(req.cookies.token, process.env.JWT_SECRET).id */
    const skip = (page - 1) * ITEMS_PER_PAGE; //Page 2: (1*5 =>5)
    const count = await Url.count({ createdBy: user_id });
    console.log(await Url.count({ createdBy: user_id }));
    const pageCount = Math.ceil(count / ITEMS_PER_PAGE) || 1;

    const items = await Url.find({ createdBy: user_id })
      .sort({ createdAt: -1 })
      .limit(ITEMS_PER_PAGE)
      .skip(skip);

    // console.log({ page, items, count, pageCount })
    res.status(200).send({ page, items, count, pageCount });
  } catch (error) {
    console.log(error);
    res.status(304).send(error);
  }
};

// READ SINGLE SHORT URL => GET: /api/url/:urlcode
exports.getUrlByUrlCode = async (req, res, next) => {
  try {
    const { urlCode } = req.params;
    const dataExists = await Url.findOne({ urlCode: urlCode });

    if (!dataExists)
      return res.status(404).send({ message: "Invalid URL code" });

    dataExists.visitCount = dataExists.visitCount + 1;
    dataExists.save(); // Try Another method

    return res.status(200).json({ sourceUrl: dataExists.originalLink });
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).send({ message: "Error getUrlByUrlCode", error: error });
  }
};

// DELETE SHORT URL => DELETE: /api/url/:id
exports.deleteShortUrl = async (req, res, next) => {
  console.log("Called Delete short url endpoint");
  let page = req.get("page") || 1;
  console.log(req.get("page"));
  console.log("Page", page);
  try {
    const short_url_Exists = await Url.findById(req.params.id);
    console.log("short urls exists", short_url_Exists);
    if (!short_url_Exists)
      return res
        .status(404)
        .send({ message: "Short Url not found with id" + req.params.id });

    const removed_data = await Url.findByIdAndRemove(req.params.id);
    console.log(removed_data);

    const user_id =
      (await jwt.verify(req.get("token"), process.env.JWT_SECRET).id) || "";
    console.log("USer Id:", user_id);
    /* jwt.verify(req.cookies.token, process.env.JWT_SECRET).id */

    const count = await Url.count({ createdBy: user_id });
    console.log("Count of Urls:", await Url.count({ createdBy: user_id }));
    const pageCount = Math.ceil(count / ITEMS_PER_PAGE) || 1;
    console.log("pageCount", pageCount);

    if (page > pageCount) {
      page = pageCount;
    }
    let skip = (page - 1) * ITEMS_PER_PAGE;

    console.log("filtering:", user_id, ITEMS_PER_PAGE, skip);
    const items = await Url.find({ createdBy: user_id })
      .sort({ createdAt: -1 })
      .limit(ITEMS_PER_PAGE)
      .skip(skip);

    console.log({ page, count, pageCount });
    res.status(200).send({ page, items, count, pageCount });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error deleteShortUrl" });
  }
};

const deleteUrl = async (req, res) => {
  Post.findByIdAndDelete(req.params.id)
    .then((result) =>
      res
        .status(200)
        .send({
          success: true,
          data: result,
          message: "Post deleted successfully",
          type: "success",
        })
    )
    .catch((err) => console.log("Error while deleting post: ", err));
};
