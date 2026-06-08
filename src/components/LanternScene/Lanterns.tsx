import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import sceneConfig from '../../config/sceneConfig.json';
import blessingsData from '../../config/blessings.json';
import { LanternData, SceneConfig, Blessing } from '../../types';

const config = sceneConfig as SceneConfig;
const blessings = blessingsData.blessings as Blessing[];

const LANTERN_COLORS = [
  '#C41E3A',
  '#DC143C',
  '#B22222',
  '#FF0000',
  '#CD5C5C',
  '#F08080',
];

function createLanternGeometry(): THREE.BufferGeometry {
  const bodyGeom = new THREE.CylinderGeometry(0.35, 0.45, 0.8, 16, 1);
  const topGeom = new THREE.ConeGeometry(0.4, 0.2, 16, 1);
  const bottomGeom = new THREE.ConeGeometry(0.4, 0.2, 16, 1, true);
  const topCapGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
  const bottomCapGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
  const tasselGeom = new THREE.CylinderGeometry(0.03, 0.05, 0.4, 8);

  topGeom.translate(0, 0.5, 0);
  bottomGeom.translate(0, -0.5, 0);
  bottomGeom.rotateX(Math.PI);
  topCapGeom.translate(0, 0.65, 0);
  bottomCapGeom.translate(0, -0.65, 0);
  tasselGeom.translate(0, -0.9, 0);

  const mergedGeom = mergeGeometriesFallback([bodyGeom, topGeom, bottomGeom, topCapGeom, bottomCapGeom, tasselGeom]);

  bodyGeom.dispose();
  topGeom.dispose();
  bottomGeom.dispose();
  topCapGeom.dispose();
  bottomCapGeom.dispose();
  tasselGeom.dispose();

  return mergedGeom;
}

function mergeGeometriesFallback(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let indexOffset = 0;

  for (const geom of geometries) {
    const pos = geom.attributes.position;
    const norm = geom.attributes.normal;
    const uv = geom.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
      if (uv) uvs.push(uv.getX(i), uv.getY(i));
      else uvs.push(0, 0);
    }

    if (geom.index) {
      for (let i = 0; i < geom.index.count; i++) {
        indices.push(geom.index.getX(i) + indexOffset);
      }
    } else {
      for (let i = 0; i < pos.count; i++) {
        indices.push(i + indexOffset);
      }
    }

    indexOffset += pos.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  merged.setIndex(indices);

  return merged;
}

function generateLanternPositions(): LanternData[] {
  const result: LanternData[] = [];
  const { count, minSpacing, maxSpacing, minHeight, maxHeight } = config.lanterns;
  const { length, width } = config.street;
  const perSide = Math.ceil(count / 2);

  for (const side of [-1, 1]) {
    let zPos = -length / 2 + 3;
    let id = side === -1 ? 0 : perSide;

    while (zPos < length / 2 - 3 && id < (side === -1 ? perSide : count)) {
      const height = minHeight + Math.random() * (maxHeight - minHeight);
      const xOffset = 0.5 + Math.random() * 1.5;
      const blessingId = blessings[Math.floor(Math.random() * blessings.length)].id;
      const color = LANTERN_COLORS[Math.floor(Math.random() * LANTERN_COLORS.length)];
      const phase = Math.random() * Math.PI * 2;

      result.push({
        id,
        position: [side * (width / 2 + xOffset), height, zPos],
        blessingId,
        color,
        phase,
      });

      zPos += minSpacing + Math.random() * (maxSpacing - minSpacing);
      id++;
    }
  }

  return result;
}

const vertexShader = `
  attribute float phase;
  attribute vec3 instanceColor;

  varying vec3 vColor;
  varying float vEmissive;

  uniform float time;

  void main() {
    vColor = instanceColor;

    float floatOffset = sin(time * 1.5 + phase) * 0.05;
    vec3 pos = position;
    pos.y += floatOffset;

    float breathe = 0.8 + sin(time * 2.0 + phase) * 0.2;
    vEmissive = breathe;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vEmissive;

  uniform vec3 emissiveColor;
  uniform float emissiveIntensity;

  void main() {
    vec3 color = vColor;
    vec3 emissive = emissiveColor * emissiveIntensity * vEmissive;
    vec3 finalColor = color + emissive;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface LanternsProps {
  onLanternsGenerated: (lanterns: LanternData[]) => void;
}

export default function Lanterns({ onLanternsGenerated }: LanternsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lightPoolRef = useRef<THREE.PointLight[]>([]);
  const dayNightMode = useGameStore((state) => state.dayNightMode);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const timeRef = useRef(0);

  const lanternData = useMemo(() => generateLanternPositions(), []);
  const lanternGeometry = useMemo(() => createLanternGeometry(), []);

  const lanternMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        emissiveColor: { value: new THREE.Color(0xff4400) },
        emissiveIntensity: { value: dayNightMode === 'night' ? 0.8 : 0.2 },
      },
    });
  }, [dayNightMode]);

  useEffect(() => {
    onLanternsGenerated(lanternData);
  }, [lanternData, onLanternsGenerated]);

  useEffect(() => {
    const lights: THREE.PointLight[] = [];
    const numLights = 24;

    for (let i = 0; i < numLights; i++) {
      const light = new THREE.PointLight(0xff4400, 0, 8, 2);
      lights.push(light);
    }

    lightPoolRef.current = lights;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const dummy = new THREE.Object3D();
    const colors = new Float32Array(lanternData.length * 3);
    const phases = new Float32Array(lanternData.length);

    lanternData.forEach((lantern, i) => {
      dummy.position.set(...lantern.position);
      dummy.rotation.y = Math.random() * 0.2 - 0.1;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const color = new THREE.Color(lantern.color);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      phases[i] = lantern.phase;
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colors, 3));
    mesh.geometry.setAttribute('phase', new THREE.InstancedBufferAttribute(phases, 1));
  }, [lanternData]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (meshRef.current && meshRef.current.material instanceof THREE.ShaderMaterial) {
      meshRef.current.material.uniforms.time.value = timeRef.current;
      meshRef.current.material.uniforms.emissiveIntensity.value = dayNightMode === 'night' ? 0.8 : 0.2;
    }

    if (lightPoolRef.current.length > 0) {
      const sortedLanterns = [...lanternData]
        .map((lantern) => {
          const dx = lantern.position[0] - playerPosition[0];
          const dy = lantern.position[1] - playerPosition[1];
          const dz = lantern.position[2] - playerPosition[2];
          return { lantern, dist: Math.sqrt(dx * dx + dy * dy + dz * dz) };
        })
        .sort((a, b) => a.dist - b.dist);

      const maxDist = dayNightMode === 'night' ? 20 : 10;

      lightPoolRef.current.forEach((light, i) => {
        if (i < sortedLanterns.length && sortedLanterns[i].dist < maxDist) {
          const lantern = sortedLanterns[i].lantern;
          light.position.set(...lantern.position);
          light.intensity = dayNightMode === 'night'
            ? Math.max(0, 1 - sortedLanterns[i].dist / maxDist) * 1.5
            : Math.max(0, 1 - sortedLanterns[i].dist / maxDist) * 0.3;
          light.distance = dayNightMode === 'night' ? 10 : 5;
        } else {
          light.intensity = 0;
        }
      });
    }
  });

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[lanternGeometry, lanternMaterial, lanternData.length]}
        castShadow
      />

      {lightPoolRef.current.map((light, i) => (
        <primitive key={`light-${i}`} object={light} />
      ))}

      {lanternData.map((lantern, i) => (
        <mesh key={`rope-${i}`} position={[
          lantern.position[0] + (lantern.position[0] > 0 ? -0.5 : 0.5),
          5.5,
          lantern.position[2],
        ]}>
          <cylinderGeometry args={[0.02, 0.02, 5.5 - lantern.position[1] + 0.5, 4]} />
          <meshStandardMaterial color={0x3a2a1a} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
