import { gemini } from "../lib/geminiConnection";


export const basicModel = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

export const testBasicConnection = async () => {
  try {
    const result = await basicModel.generateContent("ping");
    console.log("Basic model connection: Success");
    return true;
  } catch (e) {
    console.log("Basic model connection: Failed ->", e?.message || e);
    return false;
  }
};