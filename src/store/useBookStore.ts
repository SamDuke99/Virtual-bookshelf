import { create } from "zustand";
import { Book, BookStore } from "../types";

const useBookStore = create<BookStore>((set) => ({
  books: [],
  addBook: (book: Book) =>
    set((state) => {
      // Check if book already exists
      const isDuplicate = state.books.some(
        (existingBook) => existingBook.id === book.id
      );

      if (isDuplicate) {
        return state; // Return current state without changes if duplicate
      }

      return {
        books: [
          ...state.books,
          { ...book, position: { x: 0, y: 0, z: 0, rotation: 0 } },
        ],
      };
    }),
  removeBook: (bookId: string) =>
    set((state) => ({
      books: state.books.filter((book) => book.id !== bookId),
    })),
  updateBookPosition: (bookId: string, position: Book["position"]) =>
    set((state) => ({
      books: state.books.map((book) =>
        book.id === bookId ? { ...book, position } : book
      ),
    })),
}));

export default useBookStore;
