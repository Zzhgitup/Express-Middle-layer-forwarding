const express = require("express");
const cors = require("cors");
const apitoRef = require("./router/ApitoRef");
const app = express();
const PORT = 1314;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//跨域请求配置
app.use(cors());
app.use(errorHandler);
//代理转发，中间层接口
app.all("/forward/*", apitoRef);
function errorHandler(err, req, res, next) {
  console.error("发生错误:", err.message);
  res.status(500).json({ error: "服务器内部错误" });
}
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
