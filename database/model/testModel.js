import { testBasicConnection } from "./geminiBasic";
import { testProConnection } from "./geminiPro";

export async function testAIModel() {
  try {
    const basicOk = await testBasicConnection();
    const proOk = await testProConnection();

    if (basicOk && proOk) {
      console.log("All models connected");
      return true;
    }

    if (!basicOk) console.log("Basic model connection failed");
    if (!proOk) console.log("Pro model connection failed");
    return false;
  } catch (error) {
    console.log("Unexpected error while testing AI models:", error?.message || error);
    return false;
  }
}