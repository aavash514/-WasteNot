import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs';

// Initialize the Google Cloud Vision client
const visionClient = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_VISION_API_KEY
});

/**
 * Analyzes an image to detect food content and determines the waste percentage.
 * 
 * @param imagePath Path to the image file to analyze
 * @returns A waste percentage estimate (0-100)
 */
export async function analyzeFoodWaste(imagePath: string): Promise<number> {
  try {
    // Read the file into memory
    const imageContent = fs.readFileSync(imagePath);
    
    // Perform object detection
    const [result] = await visionClient.objectLocalization({
      image: { content: imageContent }
    });
    
    const objects = result.localizedObjectAnnotations || [];
    
    // Look for food objects in the image
    const foodObjects = objects.filter(obj => 
      obj.name?.toLowerCase().includes('food') || 
      obj.name?.toLowerCase().includes('plate') ||
      obj.name?.toLowerCase().includes('dish')
    );
    
    if (foodObjects.length === 0) {
      console.log('No food detected in the image');
      return 0; // Assume no waste if no food detected (empty plate)
    }
    
    // Calculate waste based on the size and confidence of detected food objects
    // This is a simplified approach - in a real implementation, you would use
    // more sophisticated image analysis techniques specific to food waste
    
    let wastePercentage = 0;
    const totalFoodObjects = foodObjects.length;
    
    // Analyze the size and position of food objects to determine waste
    // For this simplified version, we'll use the average area covered
    // by food objects as an indicator of waste
    const totalArea = foodObjects.reduce((sum, obj) => {
      // Each object has a boundingPoly with vertices defining its location
      const vertices = obj.boundingPoly?.normalizedVertices || [];
      if (vertices.length === 4) {
        // Calculate area of the bounding box
        const width = Math.abs((vertices[1]?.x || 0) - (vertices[0]?.x || 0));
        const height = Math.abs((vertices[2]?.y || 0) - (vertices[0]?.y || 0));
        return sum + (width * height);
      }
      return sum;
    }, 0);
    
    // The less area covered by food, the less waste
    // Normalizing to 0-100 percentage
    wastePercentage = Math.min(100, Math.max(0, Math.round(totalArea * 100)));
    
    // Invert the calculation since more food remaining means more waste
    wastePercentage = 100 - wastePercentage;
    
    console.log(`Detected ${totalFoodObjects} food objects, waste percentage: ${wastePercentage}%`);
    
    return wastePercentage;
  } catch (error) {
    console.error('Error analyzing food waste:', error);
    // Default to a low waste percentage in case of error
    return 5;
  }
}