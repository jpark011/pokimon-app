import { Platform } from 'react-native';

// Use the environment variable if available, otherwise fall back to the hardcoded value
// EXPO_PUBLIC_ variables are automatically available in the client code
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.36:8080';

// Determine the base URL based on the platform
// In this case, since we are using a network IP (not localhost), it should be the same for all
const BASE_URL = API_URL;

export const classifyImage = async (imageUri: string) => {
  const formData = new FormData();

  // Append the image file to the form data
  // The 'name' field should match what the server expects (e.g., 'file')
  // We construct a file object from the URI
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
