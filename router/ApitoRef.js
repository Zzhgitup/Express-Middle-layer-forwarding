const axios = require("axios");
const FormData = require("form-data");
const multer = require("multer");
const fs = require("fs");
const apitoRef = async (req, res) => {
  const { method, headers, body } = req;
  const url = req.query.baseurl + req.originalUrl.substring(10);
  try {
    let response;
    if (
      headers["content-type"] &&
      headers["content-type"].includes("multipart/form-data")
    ) {
      // 如果是 multipart/form-data 类型，使用 multer 处理文件上传
      multer({
        limits: {
          files: 10, // 最多上传 10 个文件
          fileSize: 512000 * 8, // 单个文件最大 4MB
        },
        dest: "attachment/", // 文件暂存上传目录
      }).any()(req, res, async (err) => {
        if (err) {
          console.log(
            "🚀 ~ file: ApitoRef.js:24 ~ apitoRef ~ 文件上传错误:" + err
          );

          return res.status(400).send("文件上传错误：" + err);
        } else {
          // 如果上传成功，将文件数据放入 FormData 对象
          const formData = new FormData();
          for (const file of req.files) {
            //文件读取暂存库中的数据
            const fileStream = fs.createReadStream(file.path);
            formData.append(file.fieldname, fileStream, {
              filename: file.originalname,
            });
          }
          response = await axios({
            method,
            url,
            headers: {
              ...headers,
              "Content-Type": "multipart/form-data",
            },
            data: formData,
          });
          // 将目标服务器的响应发送给客户端
          res.status(response.status).send(response.data);
        }
      });
    } else {
      // 如果不是 multipart/form-data 类型，直接转发请求体数据
      response = await axios({
        method,
        url,
        headers,
        data: body,
      });
      // 将目标服务器的响应发送给客户端
      res.status(response.status).send(response.data);
    }
  } catch (error) {
    console.error("请求错误:", error);
    // 处理不同类型的错误，并向客户端提供有意义的错误消息
    if (error.response) {
      // 如果目标服务器返回错误响应，将错误消息传递给客户端
      res.status(error.response.status).send(error.response.data);
    } else if (error.request) {
      // 如果请求没有得到响应，返回自定义的错误消息
      res.status(500).send("无法连接到目标服务器");
    } else {
      // 其他类型的错误，返回自定义的错误消息
      res.status(500).send("发生了未知错误");
    }
  }
};

module.exports = apitoRef;
