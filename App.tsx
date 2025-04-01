import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Bookshelf from "./src/components/Bookshelf";
import SearchPage from "./src/components/SearchPage";
import ViewBooksScreen from "./src/components/ViewBooksScreen";
import useBookStore from "./src/store/useBookStore";

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  ViewBooks: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen({ navigation }: HomeScreenProps) {
  const { books } = useBookStore();

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <Bookshelf books={books} />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.searchButton]}
          onPress={() => navigation.navigate("Search")}
        >
          <Text style={styles.buttonText}>Add Books</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.viewButton]}
          onPress={() => navigation.navigate("ViewBooks")}
        >
          <Text style={styles.buttonText}>View Books</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style='auto' />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='Home'
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Search'
          component={SearchPage}
          options={{
            title: "Add Books",
            headerStyle: {
              backgroundColor: "#8b4513",
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name='ViewBooks'
          component={ViewBooksScreen}
          options={{
            title: "My Books",
            headerStyle: {
              backgroundColor: "#8b4513",
            },
            headerTintColor: "#fff",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f3ff",
  },
  canvasContainer: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    gap: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchButton: {
    backgroundColor: "#8b4513",
  },
  viewButton: {
    backgroundColor: "#2c5282",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
