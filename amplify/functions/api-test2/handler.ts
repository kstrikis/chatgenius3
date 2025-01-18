import type { APIGatewayProxyHandler } from "aws-lambda";
import OpenAI from "openai";

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("API Test2 event:", event);
  
  try {
    // Try to access the OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    console.log("OpenAI API Key exists:", !!apiKey);

    if (!apiKey) {
      throw new Error("OpenAI API key not found in environment variables");
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Make a simple test request to OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: "Say hello!" }],
      model: "gpt-3.5-turbo",
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({
        message: "OpenAI Test Response",
        timestamp: new Date().toISOString(),
        openAiResponse: completion.choices[0].message,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({
        message: "Error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
    };
  }
}; 