import { gemini } from "../lib/geminiConnection";

export const proModel = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });

export const testProConnection = async () => {
  try {
    const result = await proModel.generateContent("ping");
    console.log("Pro model connection: Success");
    return true;
  } catch (e) {
    console.log("Pro model connection: Failed ->", e?.message || e);
    return false;
  }
};