import axios from 'axios';
import { envConfig } from '../../../src/shared/config/app.config';

export async function getPexelsImage(): Promise<string> {
  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: envConfig.image,
      },
      params: {
        query: 'educational',
        per_page: 1,
        page: Math.floor(Math.random() * 1000) + 1,
      },
    });

    if (response.data.photos && response.data.photos.length > 0) {
      return response.data.photos[0].src.original;
    } else {
      throw new Error('No images found from Pexels API');
    }
  } catch (error) {
    console.error('Error fetching image from Pexels:', error);
    return null;
  }
}
