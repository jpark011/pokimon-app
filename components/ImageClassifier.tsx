import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { classifyImage, getPokemonModel } from '../services/api';
import { Pokemon3DModel } from './Pokemon3DModel';

export function ImageClassifier() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [pokemonModel, setPokemonModel] = useState<string | null>(null);
  const [pokemonName, setPokemonName] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="mb-4 text-center text-lg">We need your permission to show the camera</Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="rounded-full bg-blue-500 px-8 py-4">
          <Text className="text-lg font-bold text-white">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    // Reset previous result
    setPokemonModel(null);
    setPokemonName(null);

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        await handleClassify(photo.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      setLoading(false);
    }
  };

  const handleClassify = async (uri: string) => {
    try {
      const data = await classifyImage(uri);
      const modelUrl = getPokemonModel(data.pokemon);

      // 3. Show result
      const message = modelUrl
        ? `Pokemon: ${data.pokemon}\nModel: ${modelUrl}`
        : `Pokemon: ${data.pokemon}\n(No model found)`;

      Alert.alert('Pokemon Found!', message, [{ text: 'OK', onPress: () => setLoading(false) }]);
      setPokemonName(data.pokemon);
      setPokemonModel(modelUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to classify image');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPokemonModel(null);
    setPokemonName(null);
  };

  return (
    <View className="flex-1">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      {/* 3D Model Overlay */}
      {pokemonModel && (
        <View className="absolute top-0 right-0 bottom-0 left-0 bg-black/40">
          <Pokemon3DModel url={pokemonModel} />
          <View className="absolute top-20 w-full items-center">
            <Text className="text-4xl font-bold text-white shadow-lg">{pokemonName}</Text>
          </View>
          <TouchableOpacity
            onPress={reset}
            className="absolute bottom-10 self-center rounded-full bg-red-500 px-8 py-3">
            <Text className="font-bold text-white">Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Camera UI (hidden when model is showing) */}
      {!pokemonModel && (
        <View className="absolute top-0 right-0 bottom-0 left-0 items-center justify-end pb-20">
          {loading ? (
            <View className="items-center justify-center rounded-full bg-black/50 p-8">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="mt-2 font-semibold text-white">Analyzing...</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={takePhoto}
              className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/30 active:bg-white/50">
              <View className="h-16 w-16 rounded-full bg-white" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
