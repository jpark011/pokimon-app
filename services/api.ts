import { Platform } from 'react-native';
import pokemonData from '../assets/pokemon-data.json';

// Use the environment variable if available, otherwise fall back to the hardcoded value
// EXPO_PUBLIC_ variables are automatically available in the client code
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.36:8080';

// Determine the base URL based on the platform
// In this case, since we are using a network IP (not localhost), it should be the same for all
const BASE_URL = API_URL;

export interface ClassificationResponse {
  filename: string;
  pokemon: string;
  score: number;
  all_predictions: Array<{ label: string; score: number }>;
}

export interface Pokemon3DResponse {
  forms: Array<{
    name: string;
    model: string;
  }>;
  [key: string]: any;
}

// Use the imported JSON directly
const pokemonCache: Pokemon3DResponse[] = pokemonData as Pokemon3DResponse[];

export const classifyImage = async (imageUri: string): Promise<ClassificationResponse> => {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // @ts-ignore: React Native's FormData expects an object with uri, name, type
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  });

  try {
    const response = await fetch(`${BASE_URL}/classify`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error classifying image:', error);
    throw error;
  }
};

export const getPokemonModel = (pokemonName: string): string | null => {
  try {
    const pokemon = pokemonCache.find(
      (p) => p.forms?.[0]?.name?.toLowerCase() === pokemonName.toLowerCase()
    );

    return pokemon?.forms?.[0]?.model || null;
  } catch (error) {
    console.error('Error fetching pokemon model:', error);
    return null;
  }
};
