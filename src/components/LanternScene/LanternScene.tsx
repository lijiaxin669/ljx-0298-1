import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, FXAA } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { usePlayerControl } from '../../hooks/usePlayerControl';
import { useLanternTooltip } from '../../hooks/useLanternTooltip';
import Ground from './Ground';
import Street from './Street';
import Lanterns from './Lanterns';
import { LanternData } from '../../types';
import sceneConfig from '../../config/sceneConfig.json';
import { SceneConfig } from '../../types';

const config = sceneConfig as SceneConfig;

function SceneController({
  lanterns,
  onLoadProgress,
}: {
  lanterns: LanternData[];
  onLoadProgress: (progress: number) => void;
}) {
  const dayNightMode = useGameStore((state) => state.dayNightMode);
  const showBloom = useGameStore((state) => state.showBloom);
  const setLoaded = useGameStore((state) => state.setLoaded);
  const setPlayerControl = useGameStore((state) => state.setPlayerControl);
  const setCamera = useGameStore((state) => state.setCamera);
  const setViewportSize = useGameStore((state) => state.setViewportSize);
  const { scene, camera, size } = useThree();

  const playerControl = usePlayerControl();
  const lanternTooltip = useLanternTooltip(lanterns);
  const loadProgressRef = useRef(0);

  useEffect(() => {
    setPlayerControl({
      setJoystickInput: playerControl.setJoystickInput,
      setTouchRotation: playerControl.setTouchRotation,
    });
    return () => setPlayerControl(null);
  }, [playerControl, setPlayerControl]);

  useEffect(() => {
    setViewportSize({ width: size.width, height: size.height });
  }, [size, setViewportSize]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadProgressRef.current = Math.min(loadProgressRef.current + Math.random() * 15, 100);
      onLoadProgress(loadProgressRef.current);
      if (loadProgressRef.current >= 100) {
        clearInterval(interval);
        setTimeout(() => setLoaded(true), 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onLoadProgress, setLoaded]);

  useEffect(() => {
    if (dayNightMode === 'night') {
      scene.background = new THREE.Color(0x0a0a1a);
      scene.fog = new THREE.Fog(0x0a0a1a, 30, 100);
    } else {
      scene.background = new THREE.Color(0x87ceeb);
      scene.fog = new THREE.Fog(0x87ceeb, 50, 150);
    }
  }, [dayNightMode, scene]);

  useFrame((_, delta) => {
    playerControl.update(delta);
    lanternTooltip.update();
    camera.updateMatrixWorld();
    setCamera({
      projectionMatrix: Array.from(camera.projectionMatrix.elements),
      matrixWorldInverse: Array.from(camera.matrixWorldInverse.elements),
    });
  });

  return (
    <>
      {dayNightMode === 'night' ? (
        <>
          <ambientLight intensity={0.15} />
          <directionalLight
            position={[50, 100, 50]}
            intensity={0.1}
            color={0x4466aa}
          />
          {Array.from({ length: 100 }).map((_, i) => (
            <mesh
              key={`star-${i}`}
              position={[
                (Math.random() - 0.5) * 400,
                30 + Math.random() * 50,
                (Math.random() - 0.5) * 400,
              ]}
            >
              <sphereGeometry args={[0.1 + Math.random() * 0.2, 4, 4]} />
              <meshBasicMaterial
                color={0xffffff}
                transparent
                opacity={0.5 + Math.random() * 0.5}
              />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[50, 100, 50]}
            intensity={1.5}
            color={0xffffff}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
          />
        </>
      )}

      <Ground />
      <Street />

      {dayNightMode === 'night' && showBloom && (
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.5}
          />
          <FXAA />
        </EffectComposer>
      )}
    </>
  );
}

export default function LanternScene({
  onLoadProgress,
}: {
  onLoadProgress: (progress: number) => void;
}) {
  const [lanterns, setLanterns] = useState<LanternData[]>([]);
  const webGL2Supported = useGameStore((state) => state.webGL2Supported);
  const setWebGL2Supported = useGameStore((state) => state.setWebGL2Supported);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    setWebGL2Supported(!!gl);
  }, [setWebGL2Supported]);

  const handleLanternsGenerated = useCallback((generatedLanterns: LanternData[]) => {
    setLanterns(generatedLanterns);
  }, []);

  if (!webGL2Supported) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">WebGL 2.0 不支持</h2>
          <p className="text-gray-400 mb-6">
            您的浏览器或设备不支持 WebGL 2.0，无法运行此 3D 应用。
            <br />
            请尝试使用最新版本的 Chrome、Firefox 或 Edge 浏览器。
          </p>
          <div className="text-sm text-gray-500">
            <p>最低要求：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Chrome 90+</li>
              <li>Firefox 88+</li>
              <li>Safari 15+</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.7, 0], fov: 75, near: 0.1, far: 1000 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      <SceneController
        lanterns={lanterns}
        onLoadProgress={onLoadProgress}
      />
      <Lanterns onLanternsGenerated={handleLanternsGenerated} />
    </Canvas>
  );
}
