import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Image,
  Platform,
  Modal,
  Pressable,
  PanResponder,
} from "react-native";
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
  Vector2,
  AmbientLight,
  DirectionalLight,
  Raycaster,
  Object3D,
  Color,
} from "three";
import { Book as StoreBook } from "../types";
import Canvas from "react-native-canvas";

interface SceneBook {
  id: string;
  title: string;
  shelfIndex: number;
  position: Vector3;
  rotation: Vector3;
  mesh: Object3D;
  coverColour: string;
}

interface BookshelfProps {
  books?: StoreBook[];
}

const extractColorFromCover = (coverUrl: string): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
    "#E67E22",
    "#2ECC71",
    "#F1C40F",
    "#E74C3C",
    "#1ABC9C",
    "#34495E",
    "#8B4513",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function Bookshelf({ books: storeBooks = [] }: BookshelfProps) {
  console.log("Bookshelf component rendering");
  console.log("Initial storeBooks:", storeBooks);

  const [renderer, setRenderer] = useState<Renderer | null>(null);
  const [scene] = useState(() => new Scene());
  const [camera] = useState(() => new PerspectiveCamera(75, 1, 0.1, 1000));
  const [shelfBooks, setShelfBooks] = useState<SceneBook[]>([]);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const [selectedBook, setSelectedBook] = useState<StoreBook | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  const lastX = useRef(0);
  const isDragging = useRef(false);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);

  useEffect(() => {
    console.log("Bookshelf component mounted");
    console.log("storeBooks on mount:", storeBooks);
  }, []);

  const [bookshelf] = useState(() => {
    const group = new Group();
    const woodMaterial = new MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.6,
      metalness: 0.1,
      flatShading: true,
    });

    const backGeometry = new BoxGeometry(2.2, 2.4, 0.11);
    const backPanel = new Mesh(backGeometry, woodMaterial);
    backPanel.position.z = -0.55;
    backPanel.castShadow = true;
    backPanel.receiveShadow = true;
    group.add(backPanel);

    const sideGeometry = new BoxGeometry(0.11, 2.4, 0.55);
    const leftSide = new Mesh(sideGeometry, woodMaterial);
    leftSide.position.x = -1.1;
    leftSide.position.z = -0.22;
    leftSide.castShadow = true;
    leftSide.receiveShadow = true;
    group.add(leftSide);

    const rightSide = new Mesh(sideGeometry, woodMaterial);
    rightSide.position.x = 1.1;
    rightSide.position.z = -0.22;
    rightSide.castShadow = true;
    rightSide.receiveShadow = true;
    group.add(rightSide);

    const shelfGeometry = new BoxGeometry(2.2, 0.11, 0.55);
    for (let i = 0; i < 3; i++) {
      const shelf = new Mesh(shelfGeometry, woodMaterial);
      shelf.position.y = 0.8 - i * 0.8;
      shelf.position.z = -0.22;
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      group.add(shelf);
    }

    return group;
  });

  useEffect(() => {
    console.log("=== Bookshelf Component ===");
    console.log("storeBooks changed:", storeBooks);
    console.log("Current shelfBooks:", shelfBooks);
  }, [storeBooks, shelfBooks]);

  useEffect(() => {
    console.log("=== Processing storeBooks ===");
    if (!storeBooks) {
      console.log("No storeBooks provided");
      return;
    }

    console.log("storeBooks length:", storeBooks.length);
    console.log("shelfBooks length:", shelfBooks.length);

    shelfBooks.forEach((shelfBook) => {
      const isInStore = storeBooks.some(
        (storeBook) => storeBook.id === shelfBook.id
      );
      if (!isInStore) {
        console.log("Removing book that's no longer in store:", shelfBook.id);
        removeBook(shelfBook);
      }
    });

    storeBooks.forEach((book) => {
      console.log("Processing book:", {
        id: book.id,
        title: book.title,
        authors: book.authors,
      });

      const isBookOnShelf = shelfBooks.some(
        (shelfBook) => shelfBook.id === book.id
      );
      console.log("Is book on shelf?", isBookOnShelf);

      if (!isBookOnShelf) {
        console.log("Adding new book to shelf:", book.id);
        addBookToShelf(book);
      } else {
        console.log("Book already on shelf:", book.id);
      }
    });
  }, [storeBooks]);

  const addBookToShelf = async (book: StoreBook) => {
    console.log("=== Adding Book to Shelf ===");
    console.log("Book details:", book);

    const booksOnShelf = shelfBooks.filter((b) => b.shelfIndex === 0).length;
    console.log("Current books on shelf:", booksOnShelf);

    if (booksOnShelf >= 4) {
      console.log("Shelf is full!");
      return;
    }

    const coverColor = extractColorFromCover(book.coverUrl);
    console.log("Extracted cover color:", coverColor);

    console.log("Creating book...");
    const bookGroup = new Group();

    const BOOK_WIDTH = 0.5;
    const BOOK_HEIGHT = 0.6;
    const BOOK_DEPTH = 0.15;

    const coverMaterial = new MeshStandardMaterial({
      color: new Color(coverColor),
      roughness: 0.7,
      metalness: 0.1,
    });

    const spineMaterial = new MeshStandardMaterial({
      color: new Color(coverColor).multiplyScalar(0.8),
      roughness: 0.7,
      metalness: 0.1,
    });

    const bookGeometry = new BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, BOOK_DEPTH);
    const bookMesh = new Mesh(bookGeometry, [
      coverMaterial,
      coverMaterial,
      spineMaterial,
      spineMaterial,
      coverMaterial,
      coverMaterial,
    ]);

    bookMesh.castShadow = true;
    bookMesh.receiveShadow = true;
    bookGroup.add(bookMesh);

    // Set initial book rotation
    bookMesh.rotation.y = Math.PI / 2;

    const xPosition = -0.9 + booksOnShelf * (BOOK_WIDTH + 0.05);
    const yPosition = 1.1;
    const zPosition = -0.22;

    bookGroup.position.set(xPosition, yPosition, zPosition);

    const sceneBook: SceneBook = {
      id: book.id,
      title: book.title,
      shelfIndex: 0,
      position: new Vector3(xPosition, yPosition, zPosition),
      rotation: new Vector3(0, Math.PI / 2, 0),
      mesh: bookGroup,
      coverColour: coverColor,
    };

    bookshelf.add(bookGroup);
    setShelfBooks((prev) => [...prev, sceneBook]);
  };

  const removeBook = (book: SceneBook) => {
    scene.remove(book.mesh);

    const booksToShift = shelfBooks.filter(
      (b) => b.shelfIndex === book.shelfIndex && b.position.x > book.position.x
    );

    const BOOK_WIDTH = 0.5;
    const BOOK_SPACING = 0.05;
    const shiftAmount = -(BOOK_WIDTH + BOOK_SPACING);

    booksToShift.forEach((bookToShift) => {
      bookToShift.position.x += shiftAmount;
      bookToShift.mesh.position.x += shiftAmount;
    });

    setShelfBooks((prev) => prev.filter((b) => b.id !== book.id));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        lastX.current = evt.nativeEvent.locationX;
        isDragging.current = true;
      },
      onPanResponderMove: (evt) => {
        if (!isDragging.current) return;

        const currentX = evt.nativeEvent.locationX;
        const delta = currentX - lastX.current;

        const rotationDelta = delta * 0.005;

        targetRotation.current = Math.max(
          -0.52,
          Math.min(0.52, targetRotation.current + rotationDelta)
        );

        lastX.current = currentX;
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        targetRotation.current = 0;
      },
    })
  ).current;

  const handleTap = (event: any) => {
    if (isDragging.current) return;
    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = Dimensions.get("window");

    mouse.current.x = (locationX / width) * 2 - 1;
    mouse.current.y = -(locationY / height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);

    const intersects = raycaster.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const clickedBook = shelfBooks.find((book) =>
        book.mesh.children.includes(clickedMesh)
      );

      if (clickedBook) {
        const storeBook = storeBooks.find((book) => book.id === clickedBook.id);
        if (storeBook) {
          setSelectedBook(storeBook);
          setModalVisible(true);
        }
      }
    }
  };

  const onContextCreate = async (gl: any) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const sceneColor = 0xf0f0f0;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(sceneColor);

    camera.position.z = 3;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);

    scene.add(bookshelf);

    const ambientLight = new AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    renderer.shadowMap.enabled = true;

    setRenderer(renderer);

    let lastTime = 0;
    const render = () => {
      requestAnimationFrame(render);
      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      const rotationDiff = targetRotation.current - currentRotation.current;
      if (Math.abs(rotationDiff) > 0.001) {
        currentRotation.current += rotationDiff * 0.1;

        scene.rotation.y = currentRotation.current;

        setRotation(currentRotation.current);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  const getScreenPosition = (position: Vector3) => {
    const vector = position.clone();

    const rotatedPosition = position.clone();
    rotatedPosition.applyAxisAngle(new Vector3(0, 1, 0), rotation);
    vector.copy(rotatedPosition);

    vector.project(camera);

    const x = ((vector.x + 1) / 2) * Dimensions.get("window").width;
    const y = (-(vector.y - 1) / 2) * Dimensions.get("window").height;

    const booksOnShelf = shelfBooks.filter((b) => b.shelfIndex === 0);
    const bookIndex = booksOnShelf.findIndex(
      (b) => b.position.x === position.x
    );

    const xOffset = -37.5 + bookIndex * 5;

    return {
      x: x + xOffset,
      y: y - 22.5,
    };
  };

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleTap}
          activeOpacity={1}
        />
        {shelfBooks.map((book) => {
          const screenPos = getScreenPosition(book.position);
          return (
            <Text
              key={book.id}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              style={[
                styles.bookTitle,
                {
                  left: screenPos.x,
                  top: screenPos.y,
                  transform: [{ rotate: "-90deg" }],
                },
              ]}
            >
              {book.title}
            </Text>
          );
        })}
      </View>

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedBook && (
              <>
                <Text style={styles.modalTitle}>{selectedBook.title}</Text>
                <Text style={styles.modalText}>
                  By {selectedBook.authors.join(", ")}
                </Text>

                {selectedBook.coverUrl && (
                  <Image
                    source={{ uri: selectedBook.coverUrl }}
                    style={styles.coverImage}
                  />
                )}
              </>
            )}
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  glView: {
    flex: 1,
  },
  bookTitle: {
    position: "absolute",
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    width: 60,
    transform: [{ rotate: "-90deg" }],
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: "left",
  },
  coverImage: {
    width: 200,
    height: 300,
    marginBottom: 15,
    resizeMode: "contain",
  },
  closeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
