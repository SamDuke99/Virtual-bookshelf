import React from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useBookStore from "../store/useBookStore";
import { Book } from "../types";

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  ViewBooks: undefined;
};

type ViewBooksScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ViewBooks">;
};

export default function ViewBooksScreen({ navigation }: ViewBooksScreenProps) {
  const { books, removeBook } = useBookStore();

  const renderBook = ({ item }: { item: Book }) => {
    return (
      <View style={styles.bookItem}>
        <View style={styles.bookCoverContainer}>
          {item.coverUrl ? (
            <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
          ) : (
            <View style={styles.bookCoverPlaceholder}>
              <Text style={styles.placeholderText}>No Cover</Text>
            </View>
          )}
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {item.authors.join(", ")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeBook(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No books added yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f3ff",
  },
  listContainer: {
    padding: 16,
  },
  bookItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#b3d9ff",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bookCoverContainer: {
    width: 60,
    height: 90,
    borderRadius: 4,
    overflow: "hidden",
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
    fontSize: 12,
    textAlign: "center",
  },
  bookInfo: {
    marginLeft: 12,
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 32,
  },
});
