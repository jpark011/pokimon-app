import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { classifyImage } from '../services/api';

export function ImageClassifier() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
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
      Alert.alert('Classification Result', JSON.stringify(data, null, 2), [
        { text: 'OK', onPress: () => setLoading(false) },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to classify image', [
        { text: 'OK', onPress: () => setLoading(false) },
      ]);
    }
  };

  return (
    <View className="flex-1">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
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
    </View>
  );
}
