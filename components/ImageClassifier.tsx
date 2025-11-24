import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { WebView } from 'react-native-webview';
import { classifyImage, API_URL } from '../services/api';

export function ImageClassifier() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [pokemonName, setPokemonName] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
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

    setPokemonName(null);
    setShowWebView(false);

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
      setPokemonName(data.pokemon);
      setShowWebView(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to classify image');
    } finally {
      setLoading(false);
    }
  };

  const closeWebView = () => {
    setShowWebView(false);
    setPokemonName(null);
  };

  return (
    <View className="flex-1">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      {/* Camera UI (hidden when loading) */}
      {!loading && (
        <View className="absolute top-0 right-0 bottom-0 left-0 items-center justify-end pb-20">
          <TouchableOpacity
            onPress={takePhoto}
            className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/30 active:bg-white/50">
            <View className="h-16 w-16 rounded-full bg-white" />
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View className="absolute top-0 right-0 bottom-0 left-0 items-center justify-center bg-black/40">
          <View className="items-center justify-center rounded-full bg-black/50 p-8">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="mt-2 font-semibold text-white">Analyzing...</Text>
          </View>
        </View>
      )}

      {/* Bottom Sheet WebView */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showWebView}
        onRequestClose={closeWebView}>
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="absolute top-0 right-0 bottom-0 left-0"
            onPress={closeWebView}
          />
          <View className="h-[80%] overflow-hidden rounded-t-3xl bg-white shadow-2xl">
            <View className="flex-row items-center justify-end border-b border-gray-200 p-4">
              <TouchableOpacity onPress={closeWebView} className="rounded-full bg-gray-100 p-2">
                <Text className="px-2 font-bold text-gray-600">✕</Text>
              </TouchableOpacity>
            </View>
            {pokemonName && (
              <WebView
                source={{ uri: `${API_URL}/3d/${pokemonName}` }}
                className="flex-1"
                startInLoadingState={true}
                renderLoading={() => (
                  <View className="absolute top-0 right-0 bottom-0 left-0 items-center justify-center bg-white">
                    <ActivityIndicator size="large" color="#blue" />
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
