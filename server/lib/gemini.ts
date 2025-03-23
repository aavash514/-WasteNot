import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


export async function checkIfImageContainsFood(imagePath: string): Promise<boolean> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
    const image = {
      inlineData: {
        data: fs.readFileSync(imagePath).toString("base64"),
        mimeType: "image/jpeg",
      },
    };
  
    const prompt = `
      Does this image show a plate of food? Respond with only "yes" or "no".
      Do not explain or include anything else.
    `;
  
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, image],
          },
        ],
      });
  
      const text = (await result.response.text()).trim().toLowerCase();
      console.log("[Gemini Food Check Response]:", text);
  
      return text.includes("yes");
    } catch (error) {
      console.error("[Gemini Food Check Error]:", error);
      return false; 
    }
  }

  

export async function analyzeFoodConsumption(
  beforePath: string,
  afterPath: string
): Promise<number> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const beforeImg = {
    inlineData: {
      data: fs.readFileSync(beforePath).toString("base64"),
      mimeType: "image/jpeg",
    },
  };

  const afterImg = {
    inlineData: {
      data: fs.readFileSync(afterPath).toString("base64"),
      mimeType: "image/jpeg",
    },
  };

  const prompt = `
    You will see two images. The first is a plate of food before eating, and the second is the plate after eating.
    Estimate what percentage of the original food is LEFT on the plate in the second image.
    Respond with ONLY a number followed by a percent sign (e.g., "25%").
    Do not explain.
  `;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            beforeImg,
            afterImg,
          ],
        },
      ],
    });

    const text = (await result.response.text()).trim();
    console.log("[Gemini Raw Response]:", text);

    const match = text.match(/(\d{1,3})\s?%/);
    if (match) {
      const percentLeft = parseInt(match[1]);
      const percentEaten = Math.max(0, Math.min(100, 100 - percentLeft));
      console.log(`[Parsed] Eaten: ${percentEaten}% (Left: ${percentLeft}%)`);
      return percentEaten;
    }

    console.warn("[Parse Warning] Could not extract % from response.");
    return 5; // Fallback percentage if Gemini fails to respond correctly
  } catch (error) {
    console.error("[Gemini API Error]:", error);
    return 5; // Fallback if API request fails
  }
}
