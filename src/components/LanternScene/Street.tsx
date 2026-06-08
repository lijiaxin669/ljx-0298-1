import { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import sceneConfig from '../../config/sceneConfig.json';
import { SceneConfig } from '../../types';

const config = sceneConfig as SceneConfig;

interface BuildingData {
  position: [number, number, number];
  size: [number, number, number];
  color: number;
  windowColor: number;
  windows: { position: [number, number, number]; lit: boolean }[];
}

export default function Street() {
  const dayNightMode = useGameStore((state) => state.dayNightMode);
  const { length, width } = config.street;

  const buildings = useMemo<BuildingData[]>(() => {
    const result: BuildingData[] = [];
    const buildingColors = [0x8b7355, 0x6b5344, 0x9c8b75, 0x7a6b5a, 0x5c4a3d];
    const windowColors = [0xffe4b5, 0xfff8dc, 0xf5deb3, 0xffe4c4];

    for (const side of [-1, 1]) {
      let zPos = -length / 2 + 2;
      while (zPos < length / 2 - 2) {
        const buildingWidth = 3 + Math.random() * 4;
        const buildingHeight = 6 + Math.random() * 6;
        const buildingDepth = 4 + Math.random() * 4;

        const xPos = side * (width / 2 + buildingDepth / 2 + 0.5);
        const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
        const windowColor = windowColors[Math.floor(Math.random() * windowColors.length)];

        const windows: { position: [number, number, number]; lit: boolean }[] = [];
        const floors = Math.floor(buildingHeight / 2);
        const cols = Math.floor(buildingWidth / 1.5);

        for (let floor = 1; floor < floors; floor++) {
          for (let col = 0; col < cols; col++) {
            windows.push({
              position: [
                xPos + side * (buildingDepth / 2 + 0.01),
                floor * 2 + 0.5,
                zPos - buildingWidth / 2 + col * 1.5 + 0.75,
              ],
              lit: Math.random() > 0.3,
            });
          }
        }

        result.push({
          position: [xPos, buildingHeight / 2, zPos],
          size: [buildingDepth, buildingHeight, buildingWidth],
          color,
          windowColor,
          windows,
        });

        zPos += buildingWidth + 0.5 + Math.random();
      }
    }

    return result;
  }, [length, width]);

  return (
    <group>
      {buildings.map((building, i) => (
        <group key={`building-${i}`}>
          <mesh position={building.position} castShadow receiveShadow>
            <boxGeometry args={building.size} />
            <meshStandardMaterial
              color={building.color}
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>

          <mesh
            position={[building.position[0], building.size[1] - 0.2, building.position[2]]}
            castShadow
          >
            <boxGeometry args={[building.size[0] + 0.2, 0.4, building.size[2] + 0.2]} />
            <meshStandardMaterial
              color={dayNightMode === 'night' ? 0x1a1a1a : 0x2a2a2a}
              roughness={0.8}
            />
          </mesh>

          {building.windows.map((window, j) => (
            <mesh key={`window-${i}-${j}`} position={window.position}>
              <boxGeometry args={[0.1, 0.8, 0.8]} />
              <meshStandardMaterial
                color={dayNightMode === 'night' && window.lit ? building.windowColor : 0x1a1a1a}
                emissive={dayNightMode === 'night' && window.lit ? building.windowColor : 0x000000}
                emissiveIntensity={dayNightMode === 'night' && window.lit ? 0.5 : 0}
              />
            </mesh>
          ))}
        </group>
      ))}

      {Array.from({ length: Math.floor(length / 15) }).map((_, i) =>
        [-1, 1].map((side) => (
          <group key={`lamp-${i}-${side}`}>
            <mesh
              position={[
                side * (width / 2 - 1),
                2.5,
                -length / 2 + i * 15 + 5,
              ]}
              castShadow
            >
              <cylinderGeometry args={[0.05, 0.08, 5, 8]} />
              <meshStandardMaterial color={0x2a2a2a} metalness={0.8} roughness={0.3} />
            </mesh>

            <mesh
              position={[
                side * (width / 2 - 1),
                5.2,
                -length / 2 + i * 15 + 5,
              ]}
            >
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial
                color={0xffffcc}
                emissive={0xffffcc}
                emissiveIntensity={dayNightMode === 'night' ? 1 : 0.2}
              />
            </mesh>

            <pointLight
              position={[
                side * (width / 2 - 1),
                5,
                -length / 2 + i * 15 + 5,
              ]}
              intensity={dayNightMode === 'night' ? 0.5 : 0.1}
              distance={15}
              decay={2}
              color={0xffffcc}
            />
          </group>
        ))
      )}
    </group>
  );
}
