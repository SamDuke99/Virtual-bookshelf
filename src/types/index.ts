export interface Book {
  id: string;
  title: string;
  authors: string[];
  coverUrl: string;
  position?: {
    x: number;
    y: number;
    z: number;
    rotation: number;
  };
}

export interface BookStore {
  books: Book[];
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateBookPosition: (id: string, position: Book["position"]) => void;
}
