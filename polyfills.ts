// More robust polyfill
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('text-encoding').TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('text-encoding').TextDecoder;
}

// Ensure atob/btoa exist
if (!global.btoa) {
  global.btoa = require('base-64').encode;
}
if (!global.atob) {
  global.atob = require('base-64').decode;
}

// Polyfill Image if it doesn't exist (often needed by texture loaders)
// However, in Expo/React Native, global.Image usually doesn't exist or behaves differently.
// We can mock it or try to rely on expo-asset to handle images if loaders support it.
// But Three.js loaders often expect a DOM-like Image.
// A common hack in older Expo Three setups:
// @ts-ignore
if (!global.Image) {
  // @ts-ignore
  global.Image = class Image {
    src: string = '';
    constructor() {}
  };
}
