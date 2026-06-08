import { useCallback, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import sceneConfig from '../config/sceneConfig.json';
import { LanternData, SceneConfig } from '../types';

const config = sceneConfig as SceneConfig;

export class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, LanternData[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private getKey(x: number, z: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return `${cellX},${cellZ}`;
  }

  insert(lantern: LanternData): void {
    const key = this.getKey(lantern.position[0], lantern.position[2]);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(lantern);
  }

  query(x: number, z: number, radius: number): LanternData[] {
    const results: LanternData[] = [];
    const minCellX = Math.floor((x - radius) / this.cellSize);
    const maxCellX = Math.floor((x + radius) / this.cellSize);
    const minCellZ = Math.floor((z - radius) / this.cellSize);
    const maxCellZ = Math.floor((z + radius) / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cz = minCellZ; cz <= maxCellZ; cz++) {
        const key = `${cx},${cz}`;
        const cell = this.grid.get(key);
        if (cell) {
          results.push(...cell);
        }
      }
    }
    return results;
  }
}

export const useLanternTooltip = (lanterns: LanternData[]) => {
  const { camera } = useThree();
  const gridRef = useRef<SpatialGrid | null>(null);
  const setNearestLantern = useGameStore((state) => state.setNearestLantern);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const triggerDistance = config.tooltip.triggerDistance;

  useEffect(() => {
    const grid = new SpatialGrid(5);
    lanterns.forEach((lantern) => grid.insert(lantern));
    gridRef.current = grid;
  }, [lanterns]);

  const update = useCallback(() => {
    if (!gridRef.current) return;

    const pos = playerPosition;
    const nearby = gridRef.current.query(pos[0], pos[2], triggerDistance + 2);

    let nearest: LanternData | null = null;
    let minDist = Infinity;

    for (const lantern of nearby) {
      const dx = lantern.position[0] - pos[0];
      const dy = lantern.position[1] - pos[1];
      const dz = lantern.position[2] - pos[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < triggerDistance && dist < minDist) {
        const lanternScreenPos = new THREE.Vector3(...lantern.position);
        lanternScreenPos.project(camera);

        if (lanternScreenPos.z < 1) {
          minDist = dist;
          nearest = lantern;
        }
      }
    }

    setNearestLantern(nearest);
  }, [camera, playerPosition, triggerDistance, setNearestLantern]);

  return { update };
};
