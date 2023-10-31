const bcrypt = require("bcryptjs");
const axios = require("axios");

exports.handler = async (event, context) => {
  // console.log("Event: ", event);
  try {
    const eventData = event;
    const valueToHash = eventData.value;
    const saltRounds = 8;
    const hashedValue = await bcrypt.hash(valueToHash, saltRounds);

    // console.log("Hi, hashed value here! ", hashedValue);

    const apiEndpoint =
      "https://v7qaxwoyrb.execute-api.us-east-1.amazonaws.com/default/end";
    const apiResponse = {
      banner: "B00945188",
      result: hashedValue,
      arn: "arn:aws:lambda:us-east-1:469571695254:function:perform-bcrypt",
      action: "bcrypt",
      originalValue: valueToHash,
    };
    await axios.post(apiEndpoint, apiResponse);

    return {
      statusCode: 200,
      body: apiResponse,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Error: " + error.message,
    };
  }
};
