import fs from 'fs';
import path from 'path';

const API_URL = 'https://pokemon-3d-api.onrender.com/v1/pokemon';
const OUTPUT_PATH = path.join(__dirname, '../assets/pokemon-data.json');

async function fetchData() {
  console.log('Fetching Pokemon 3D data...');
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

    const data = await response.json();
    console.log(`Fetched ${data.length} pokemon entries.`);

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
    console.log(`Saved data to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }
}

fetchData();
