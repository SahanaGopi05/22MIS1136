const axios = require("axios");

const LOG_API = "http://4.224.186.213/evaluation-service/logs";

async function Log(stack, level, pkg, message, token) {
  try {
    const response = await axios.post(
      LOG_API,
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Logging failed:", error.message);
  }
}

module.exports = Log;