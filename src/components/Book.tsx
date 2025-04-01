import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import {
  Scene,
  PerspectiveCamera,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  Group,
  Vector3,
  AmbientLight,
  DirectionalLight,
} from "three";

interface BookProps {
  coverColor?: string;
  position?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
}

export default function Book({
  coverColor = "#8b4513",
  position = new Vector3(0, 0, 0),
  rotation = new Vector3(0, 0, 0),
  scale = new Vector3(1, 1, 1),
}: BookProps) {
  const [scene] = React.useState(() => new Scene());
  const [camera] = React.useState(
    () => new PerspectiveCamera(75, 1, 0.1, 1000)
  );
  const [book] = React.useState(() => {
    const group = new Group();

    const BOOK_WIDTH = 0.4;
    const BOOK_HEIGHT = 0.6;
    const BOOK_DEPTH = 0.1;

    const coverMaterial = new MeshStandardMaterial({
      color: coverColor,
      roughness: 0.6,
      metalness: 0.1,
      flatShading: true,
    });

    const pagesMaterial = new MeshStandardMaterial({
      color: "#f5f5f5",
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true,
    });

    const coverGeometry = new BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, BOOK_DEPTH);
    const cover = new Mesh(coverGeometry, coverMaterial);
    cover.castShadow = true;
    cover.receiveShadow = true;
    group.add(cover);

    const pagesGeometry = new BoxGeometry(
      BOOK_WIDTH * 0.95,
      BOOK_HEIGHT * 0.95,
      BOOK_DEPTH * 0.9
    );
    const pages = new Mesh(pagesGeometry, pagesMaterial);
    pages.position.z = BOOK_DEPTH * 0.05;
    pages.castShadow = true;
    pages.receiveShadow = true;
    group.add(pages);

    group.position.copy(position);
    group.rotation.set(rotation.x, rotation.y, rotation.z);
    group.scale.copy(scale);

    return group;
  });

  const onContextCreate = async (gl: any) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0.0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = 2;

    scene.add(book);

    const ambientLight = new AmbientLight(0x808080, 1.0);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(2, 2, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);
    camera.aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    camera.updateProjectionMatrix();

    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  glView: {
    flex: 1,
  },
});
