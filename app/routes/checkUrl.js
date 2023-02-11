const controller = require("../controllers/checkUrlController");
const router = express.Router();
router.post("/", controller.createUrl);
