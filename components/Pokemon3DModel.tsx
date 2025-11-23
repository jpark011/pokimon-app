import React, { Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei/native';
import { View, Text, ActivityIndicator } from 'react-native';
import { KTX2Loader } from 'three-stdlib';

// Initialize KTX2Loader outside component to avoid recreation
const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.168.0/examples/jsm/libs/basis/');

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const { gl } = useThree();

  const { scene } = useGLTF(url, true, true, (loader) => {
    loader.setKTX2Loader(ktx2Loader.detectSupport(gl));
  });

  return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error('3D Model Error:', error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="font-bold text-white">Failed to load 3D Model</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export function Pokemon3DModel({ url }: { url: string }) {
  return (
    <View className="flex-1">
      <ErrorBoundary>
        <Suspense
          fallback={
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          }>
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ preserveDrawingBuffer: true }}>
            <ambientLight intensity={1} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />

            <Model url={url} />
            <Environment preset="city" />

            <OrbitControls enablePan={false} />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </View>
  );
}
