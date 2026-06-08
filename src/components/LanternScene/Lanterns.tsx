import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import sceneConfig from '../../config/sceneConfig.json';
import blessingsData from '../../config/blessings.json';
import { LanternData, SceneConfig, Blessing } from '../../types';

const config = sceneConfig as SceneConfig;
const blessings = blessingsData.blessings as Blessing[];

const LANTERN_COLORS = [
  0xC41E3A,
  0xDC143C,
  0xB22222,
  0xFF0000,
  0xCD5C5C,
  0xE74C3C,
];

function createLanternGeometry(): THREE.BufferGeometry {
  const bodyGeom = new THREE.CylinderGeometry(0.35, 0.45, 0.8, 12, 1);
  const topGeom = new THREE.ConeGeometry(0.4, 0.2, 12, 1);
  const bottomGeom = new THREE.ConeGeometry(0.4, 0.2, 12, 1, true);
  const topCapGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
  const bottomCapGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
  const tasselGeom = new THREE.CylinderGeometry(0.03, 0.05, 0.4, 6);

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
    let zPos = -length / 2 + 2;
    let id = side === -1 ? 0 : perSide;
    const targetCount = side === -1 ? perSide : count;

    while (id < targetCount && zPos < length / 2 - 2) {
      const height = minHeight + Math.random() * (maxHeight - minHeight);
      const xOffset = 0.5 + Math.random() * 1.5;
      const blessingId = blessings[Math.floor(Math.random() * blessings.length)].id;
      const colorIndex = Math.floor(Math.random() * LANTERN_COLORS.length);
      const phase = Math.random() * Math.PI * 2;

      result.push({
        id,
        position: [side * (width / 2 + xOffset), height, zPos],
        blessingId,
        color: `#${LANTERN_COLORS[colorIndex].toString(16).padStart(6, '0')}`,
        colorIndex,
        phase,
      });

      zPos += minSpacing + Math.random() * (maxSpacing - minSpacing);
      id++;
    }

    while (id < targetCount) {
      const height = minHeight + Math.random() * (maxHeight - minHeight);
      const xOffset = 0.5 + Math.random() * 1.5;
      const blessingId = blessings[Math.floor(Math.random() * blessings.length)].id;
      const colorIndex = Math.floor(Math.random() * LANTERN_COLORS.length);
      const phase = Math.random() * Math.PI * 2;
      const zPos = -length / 2 + 2 + Math.random() * (length - 4);

      result.push({
        id,
        position: [side * (width / 2 + xOffset), height, zPos],
        blessingId,
        color: `#${LANTERN_COLORS[colorIndex].toString(16).padStart(6, '0')}`,
        colorIndex,
        phase,
      });
      id++;
    }
  }

  return result;
}

interface LanternsProps {
  onLanternsGenerated: (lanterns: LanternData[]) => void;
}

export default function Lanterns({ onLanternsGenerated }: LanternsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const glowMeshRef = useRef<THREE.InstancedMesh>(null);
  const ropeMeshRef = useRef<THREE.InstancedMesh>(null);
  const lightPoolRef = useRef<THREE.PointLight[]>([]);
  const [lights, setLights] = useState<THREE.PointLight[]>([]);
  const dayNightMode = useGameStore((state) => state.dayNightMode);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const timeRef = useRef(0);
  const dummy = useRef(new THREE.Object3D());
  const lanternData = useMemo(() => generateLanternPositions(), []);
  const lanternGeometry = useMemo(() => createLanternGeometry(), []);
  const glowGeometry = useMemo(() => new THREE.SphereGeometry(0.5, 8, 8), []);
  const ropeGeometry = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 1, 4), []);

  const lanternMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.5,
      metalness: 0.1,
    });
  }, []);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.3,
    });
  }, []);

  const ropeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
  }, []);

  useEffect(() => {
    onLanternsGenerated(lanternData);
  }, [lanternData, onLanternsGenerated]);

  useEffect(() => {
    const lightArray: THREE.PointLight[] = [];
    const numLights = 24;

    for (let i = 0; i < numLights; i++) {
      const light = new THREE.PointLight(0xff4400, 0, 8, 2);
      lightArray.push(light);
    }

    lightPoolRef.current = lightArray;
    setLights(lightArray);
  }, []);

  useEffect(() => {
    if (!meshRef.current || !glowMeshRef.current || !ropeMeshRef.current) return;

    const mesh = meshRef.current;
    const glowMesh = glowMeshRef.current;
    const ropeMesh = ropeMeshRef.current;

    lanternData.forEach((lantern, i) => {
      dummy.current.position.set(...lantern.position);
      dummy.current.rotation.y = Math.random() * 0.2 - 0.1;
      dummy.current.updateMatrix();
      mesh.setMatrixAt(i, dummy.current.matrix);
      mesh.setColorAt(i, new THREE.Color(LANTERN_COLORS[lantern.colorIndex ?? 0]));

      dummy.current.scale.setScalar(1.2);
      dummy.current.updateMatrix();
      glowMesh.setMatrixAt(i, dummy.current.matrix);
      glowMesh.setColorAt(i, new THREE.Color(0xff4400));

      const ropeHeight = 5.5 - lantern.position[1] + 0.5;
      dummy.current.position.set(
        lantern.position[0] + (lantern.position[0] > 0 ? -0.5 : 0.5),
        5.5 - ropeHeight / 2,
        lantern.position[2]
      );
      dummy.current.rotation.set(0, 0, 0);
      dummy.current.scale.set(1, ropeHeight, 1);
      dummy.current.updateMatrix();
      ropeMesh.setMatrixAt(i, dummy.current.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    glowMesh.instanceMatrix.needsUpdate = true;
    if (glowMesh.instanceColor) glowMesh.instanceColor.needsUpdate = true;

    ropeMesh.instanceMatrix.needsUpdate = true;
  }, [lanternData]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (meshRef.current && glowMeshRef.current) {
      lanternData.forEach((lantern, i) => {
        const floatOffset = Math.sin(timeRef.current * 1.5 + lantern.phase) * 0.05;
        const breathe = 0.8 + Math.sin(timeRef.current * 2.0 + lantern.phase) * 0.2;

        dummy.current.position.set(
          lantern.position[0],
          lantern.position[1] + floatOffset,
          lantern.position[2]
        );
        dummy.current.rotation.y = Math.sin(timeRef.current * 0.5 + lantern.phase) * 0.1;
        dummy.current.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.current.matrix);

        const glowScale = 1.0 + breathe * 0.3;
        dummy.current.scale.setScalar(glowScale);
        dummy.current.updateMatrix();
        glowMeshRef.current!.setMatrixAt(i, dummy.current.matrix);

        if (glowMeshRef.current!.instanceColor) {
          const glowColor = new THREE.Color(0xff4400);
          glowColor.multiplyScalar(0.2 + breathe * 0.3);
          glowMeshRef.current!.instanceColor.setXYZ(i, glowColor.r, glowColor.g, glowColor.b);
        }
      });

      meshRef.current.instanceMatrix.needsUpdate = true;
      glowMeshRef.current.instanceMatrix.needsUpdate = true;
      if (glowMeshRef.current.instanceColor) {
        glowMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (lightPoolRef.current.length > 0) {
      const maxDist = dayNightMode === 'night' ? 25 : 12;
      const activeLanterns: { lantern: LanternData; dist: number }[] = [];

      for (const lantern of lanternData) {
        const dx = lantern.position[0] - playerPosition[0];
        const dz = lantern.position[2] - playerPosition[2];
        const distXZ = Math.sqrt(dx * dx + dz * dz);

        if (distXZ < maxDist) {
          const dy = lantern.position[1] - playerPosition[1];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          activeLanterns.push({ lantern, dist });
        }
      }

      activeLanterns.sort((a, b) => a.dist - b.dist);

      lightPoolRef.current.forEach((light, i) => {
        if (i < activeLanterns.length) {
          const { lantern, dist } = activeLanterns[i];
          light.position.set(
            lantern.position[0],
            lantern.position[1] + Math.sin(timeRef.current * 1.5 + lantern.phase) * 0.05,
            lantern.position[2]
          );
          light.intensity = dayNightMode === 'night'
            ? Math.max(0, 1 - dist / maxDist) * 1.5
            : Math.max(0, 1 - dist / maxDist) * 0.3;
          light.distance = dayNightMode === 'night' ? 12 : 6;
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

      <instancedMesh
        ref={glowMeshRef}
        args={[glowGeometry, glowMaterial, lanternData.length]}
      />

      <instancedMesh
        ref={ropeMeshRef}
        args={[ropeGeometry, ropeMaterial, lanternData.length]}
        castShadow
      />

      {lights.map((light, i) => (
        <primitive key={`light-${i}`} object={light} />
      ))}
    </group>
  );
}
