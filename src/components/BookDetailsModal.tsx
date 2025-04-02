import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Book } from "../types";

interface BookDetailsModalProps {
  book: Book | null;
  visible: boolean;
  onClose: () => void;
}

export default function BookDetailsModal({
  book,
  visible,
  onClose,
}: BookDetailsModalProps) {
  if (!book) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{book.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bookCoverContainer}>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.bookCover} />
            ) : (
              <View style={styles.bookCoverPlaceholder}>
                <Text style={styles.placeholderText}>No Cover</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Authors:</Text>
            <Text style={styles.value}>{book.authors.join(", ")}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: Dimensions.get("window").width * 0.8,
    maxHeight: Dimensions.get("window").height * 0.8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  bookCoverContainer: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    alignSelf: "center",
  },
  bookCover: {
    width: "100%",
    height: "100%",
  },
  bookCoverPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
  },
  detailsContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
});
