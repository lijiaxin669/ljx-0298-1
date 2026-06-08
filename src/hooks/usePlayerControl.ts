import { useEffect, useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import sceneConfig from '../config/sceneConfig.json';
import { SceneConfig } from '../types';

const config = sceneConfig as SceneConfig;

export const usePlayerControl = () => {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const yaw = useRef(0);
  const pitch = useRef(0);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const joystickInput = useRef({ x: 0, y: 0 });

  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setPlayerRotation = useGameStore((state) => state.setPlayerRotation);
  const setPointerLocked = useGameStore((state) => state.setPointerLocked);
  const isPointerLocked = useGameStore((state) => state.isPointerLocked);

  const streetHalfWidth = config.street.width / 2;
  const streetHalfLength = config.street.length / 2;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keys.current.add(e.code);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keys.current.delete(e.code);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPointerLocked) return;
    const sensitivity = config.player.mouseSensitivity;
    yaw.current -= e.movementX * sensitivity;
    pitch.current -= e.movementY * sensitivity;
    pitch.current = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch.current));
  }, [isPointerLocked]);

  const handlePointerLockChange = useCallback(() => {
    const locked = document.pointerLockElement === gl.domElement;
    setPointerLocked(locked);
  }, [gl.domElement, setPointerLocked]);

  const requestPointerLock = useCallback(() => {
    if (!isPointerLocked) {
      gl.domElement.requestPointerLock();
    }
  }, [gl.domElement, isPointerLocked]);

  const setJoystickInput = useCallback((x: number, y: number) => {
    joystickInput.current.x = x;
    joystickInput.current.y = y;
  }, []);

  const setTouchRotation = useCallback((deltaX: number, deltaY: number) => {
    const sensitivity = config.player.mouseSensitivity * 0.5;
    yaw.current -= deltaX * sensitivity;
    pitch.current -= deltaY * sensitivity;
    pitch.current = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, pitch.current));
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handlePointerLockChange]);

  const update = useCallback((delta: number) => {
    const speed = config.player.speed;

    velocity.current.x -= velocity.current.x * 10 * delta;
    velocity.current.z -= velocity.current.z * 10 * delta;

    let forward = 0;
    let strafe = 0;

    if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) forward -= 1;
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) forward += 1;
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) strafe -= 1;
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) strafe += 1;

    forward += joystickInput.current.y;
    strafe += joystickInput.current.x;

    if (forward !== 0 || strafe !== 0) {
      direction.current.set(strafe, 0, forward).normalize();
      velocity.current.add(direction.current.multiplyScalar(speed));
    }

    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    const moveDirection = new THREE.Vector3();
    camera.getWorldDirection(moveDirection);
    moveDirection.y = 0;
    moveDirection.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(moveDirection, new THREE.Vector3(0, 1, 0)).normalize();

    const deltaX = (moveDirection.x * -velocity.current.z + right.x * velocity.current.x) * delta;
    const deltaZ = (moveDirection.z * -velocity.current.z + right.z * velocity.current.x) * delta;

    let newX = camera.position.x + deltaX;
    let newZ = camera.position.z + deltaZ;

    newX = Math.max(-streetHalfWidth + 0.5, Math.min(streetHalfWidth - 0.5, newX));
    newZ = Math.max(-streetHalfLength + 1, Math.min(streetHalfLength - 1, newZ));

    camera.position.x = newX;
    camera.position.z = newZ;

    const headBob = Math.abs(velocity.current.z) > 0.1 || Math.abs(velocity.current.x) > 0.1
      ? Math.sin(Date.now() * 0.01) * 0.05
      : 0;
    camera.position.y = 1.7 + headBob;

    setPlayerPosition([camera.position.x, camera.position.y, camera.position.z]);
    setPlayerRotation([yaw.current, pitch.current]);
  }, [camera, setPlayerPosition, setPlayerRotation, streetHalfWidth, streetHalfLength]);

  return { update, requestPointerLock, setJoystickInput, setTouchRotation };
};
