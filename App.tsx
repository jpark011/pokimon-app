import './polyfills';
import { ImageClassifier } from 'components/ImageClassifier';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import './global.css';

export default function App() {
  return (
    <View className="flex-1 bg-black">
      <ImageClassifier />
      <StatusBar style="light" />
    </View>
  );
}
