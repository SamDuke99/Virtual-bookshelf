import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useBookStore from "../store/useBookStore";
import { Book } from "../types";

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  ViewBooks: undefined;
};

type SearchPageProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Search">;
};

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail: string;
    };
  };
}

export default function SearchPage({ navigation }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const { books: existingBooks, addBook } = useBookStore();

  const searchBooks = async (query: string) => {
    if (!query.trim()) {
      setBooks([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      setBooks(data.items || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchBooks(text);
  };

  const handleBookSelect = (book: GoogleBook) => {
    // Check if book is already in the bookshelf
    const isDuplicate = existingBooks.some(
      (existingBook) => existingBook.id === book.id
    );

    if (isDuplicate) {
      Alert.alert(
        "Book Already Added",
        "This book is already in your bookshelf.",
        [{ text: "OK" }]
      );
      return;
    }

    const newBook: Book = {
      id: book.id,
      title: book.volumeInfo?.title || "Unknown Title",
      authors: book.volumeInfo?.authors || ["Unknown Author"],
      coverUrl:
        book.volumeInfo?.imageLinks?.thumbnail ||
        "https://via.placeholder.com/150x200?text=No+Cover",
    };

    addBook(newBook);
    navigation.goBack();
  };

  const renderBook = ({ item }: { item: GoogleBook }) => {
    const thumbnail = item.volumeInfo?.imageLinks?.thumbnail;
    const title = item.volumeInfo?.title || "Unknown Title";
    const authors = item.volumeInfo?.authors?.join(", ") || "Unknown Author";
    const isDuplicate = existingBooks.some(
      (existingBook) => existingBook.id === item.id
    );

    return (
      <TouchableOpacity
        style={[styles.bookItem, isDuplicate && styles.duplicateBook]}
        onPress={() => handleBookSelect(item)}
        disabled={isDuplicate}
      >
        <View style={styles.bookCoverContainer}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.bookCover} />
          ) : (
            <View style={styles.bookCoverPlaceholder}>
              <Text style={styles.placeholderText}>No Cover</Text>
            </View>
          )}
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {authors}
          </Text>
          {isDuplicate && (
            <Text style={styles.duplicateText}>Already in bookshelf</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Search for books...'
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size='large' color='#8b4513' style={styles.loader} />
      ) : (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No books found"
                : "Search for books to add to your shelf"}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f3ff",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#e6f3ff",
    borderBottomWidth: 1,
    borderBottomColor: "#b3d9ff",
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
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
  duplicateBook: {
    opacity: 0.7,
    backgroundColor: "#f8f9fa",
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
  duplicateText: {
    fontSize: 12,
    color: "#8b4513",
    fontStyle: "italic",
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 32,
  },
});
