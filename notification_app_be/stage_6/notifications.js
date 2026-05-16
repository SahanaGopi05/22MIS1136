const axios = require("axios");
const Log = require("../../logging_middleware");

require("dotenv").config({
  path: "../../.env",
});

const NOTIFICATION_API =
  "http://4.224.186.213/evaluation-service/notifications";

const priorityWeights = {
  Placement: 30,
  Result: 20,
  Event: 10,
};

async function getNotifications() {

  try {

    await Log(
      "backend",
      "info",
      "service",
      "Started fetching notifications",
      process.env.ACCESS_TOKEN
    );

    const { data } = await axios({
      method: "GET",
      url: NOTIFICATION_API,
      headers: {
        Authorization:
          `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });

    return data.notifications || [];

  } catch (err) {

    await Log(
      "backend",
      "error",
      "service",
      "Unable to fetch notifications",
      process.env.ACCESS_TOKEN
    );

    console.log(
      err.response?.data ||
      err.message
    );

    return [];
  }
}

function buildPriorityFeed(data) {

  const sortedFeed = data.sort((first, second) => {

    const weightDifference =
      (priorityWeights[second.Type] || 0) -
      (priorityWeights[first.Type] || 0);

    if (weightDifference !== 0) {
      return weightDifference;
    }

    return (
      new Date(second.Timestamp).getTime() -
      new Date(first.Timestamp).getTime()
    );
  });

  return sortedFeed.slice(0, 10);
}

async function generateFeed() {

  const notificationList =
    await getNotifications();

  const priorityFeed =
    buildPriorityFeed(notificationList);

  await Log(
    "backend",
    "info",
    "service",
    "Priority feed generated successfully",
    process.env.ACCESS_TOKEN
  );

  console.log("\nPriority Notifications\n");

  priorityFeed.forEach((notification, i) => {

    console.log(
      `${i + 1}. ${notification.Type} : ${notification.Message}`
    );

  });
}

generateFeed();