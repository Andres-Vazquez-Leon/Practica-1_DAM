import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, TextInput, Alert, ScrollView } from 'react-native';
import { Image } from 'expo-image';

export default function App() {

  //Login y Favoritos
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [favorites, setFavorites] = useState([]); // Arreglo para guardar los Pokémon favoritos
  const [showFavorites, setShowFavorites] = useState(false);

  //Pokédex de la clase
  const [id, setId] = useState(1);
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook original para hacer la petición a PokeAPI
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setPokemon(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoading(false);
          console.error("Error cargando Pokémon:", err);
        }
      });

    return () => { cancelled = true; };
  }, [id]);

  //FUNCIONES LÓGICAS
  const handleLogin = () => {
    // Usuario y contraseña de prueba
    if (username === 'admin' && password === '1234') {
      setIsLoggedIn(true);
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos. Usa admin / 1234');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setShowFavorites(false);
  };

  const toggleFavorite = () => {
    if (!pokemon) return;
    
    // Comprobar si ya está en favoritos
    const isAlreadyFav = favorites.some(fav => fav.id === pokemon.id);
    
    if (isAlreadyFav) {
      // Quitar de favoritos
      setFavorites(favorites.filter(fav => fav.id !== pokemon.id));
    } else {
      // Agregar a favoritos guardando datos clave
      setFavorites([...favorites, {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.front_default
      }]);
    }
  };

  // Saber si el pokemon actual está en la lista de favoritos
  const isCurrentFavorite = pokemon ? favorites.some(fav => fav.id === pokemon.id) : false;

  // Pantallas

  // LOGIN
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Iniciar Sesión</Text>
          <Text style={styles.loginSubtitle}>Pokédex Institucional</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Usuario (ej. admin)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña (ej. 1234)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // LISTA DE FAVORITOS
  if (showFavorites) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.headerRow}>
          <Text style={styles.viewTitle}>Tus Favoritos</Text>
          <Pressable style={styles.smallButton} onPress={() => setShowFavorites(false)}>
            <Text style={styles.smallButtonText}>Volver</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.favoritesList}>
          {favorites.length === 0 ? (
            <Text style={styles.emptyText}>No tienes Pokémon favoritos aún.</Text>
          ) : (
            favorites.map((fav) => (
              <View key={fav.id} style={styles.favoriteItem}>
                <Image source={fav.image} style={styles.favImage} contentFit="contain" />
                <Text style={styles.favName}>#{fav.id} {fav.name.toUpperCase()}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  //  POKÉDEX PRINCIPAL 
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Barra superior con Cerrar sesión y Ver Favoritos */}
      <View style={styles.topBar}>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>
        <Pressable style={styles.smallButton} onPress={() => setShowFavorites(true)}>
          <Text style={styles.smallButtonText}>Ver Favoritos ({favorites.length})</Text>
        </Pressable>
      </View>
      
      <View style={styles.card}>
        {loading || !pokemon ? (
          <ActivityIndicator size="large" color="#003366" /> 
        ) : (
          <>
            <View style={styles.pokemonHeader}>
              <Text style={styles.name}>
                #{pokemon.id} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </Text>
              {/* Botón de Favorito */}
              <Pressable onPress={toggleFavorite} style={styles.favIconBtn}>
                <Text style={styles.favIconText}>
                  {isCurrentFavorite ? '⭐ Guardado' : '☆ Guardar'}
                </Text>
              </Pressable>
            </View>
            
            <Image
              style={styles.image}
              source={pokemon.sprites.front_default}
              contentFit="contain"
            />
          </>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, id === 1 && styles.buttonDisabled]}
          onPress={() => setId((current) => Math.max(1, current - 1))}
          disabled={id === 1}
        >
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
        
        <Pressable 
          style={styles.button} 
          onPress={() => setId((current) => current + 1)}
        >
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  // --- Estilos Login ---
  loginCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    padding: 30,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFCC00',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#003366',
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  // --- Estilos Generales ---
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    top: 50,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: '#003366',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  smallButton: {
    backgroundColor: '#FFCC00',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  smallButtonText: {
    color: '#003366',
    fontWeight: 'bold',
  },
  card: {
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFCC00',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    padding: 20,
    marginTop: 40,
  },
  pokemonHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 32,
    fontWeight: '900',
    color: '#003366',
  },
  favIconBtn: {
    marginTop: 5,
    backgroundColor: '#003366',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  favIconText: {
    color: '#FFCC00',
    fontWeight: 'bold',
    fontSize: 14,
  },
  image: {
    width: 220,
    height: 220,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 30,
  },
  button: {
    backgroundColor: '#003366',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#B3C6D9',
    elevation: 0,
  },
  buttonText: {
    color: '#FFCC00',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  // --- Estilos Favoritos ---
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 20,
  },
  viewTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003366',
  },
  favoritesList: {
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#FFCC00',
  },
  favImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  favName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
  }
});
```eof

### ¿Cómo funciona ahora?
1. **Login:** Al abrir la app, verás la pantalla de inicio de sesión. Las credenciales de prueba son **Usuario:** `admin` y **Contraseña:** `1234`.
2. **Pokédex Principal:** Una vez dentro, verás el código que hizo el profesor, pero con una mejora: debajo del nombre del Pokémon hay un botón que dice **"☆ Guardar"**. Si lo presionas, cambia a **"⭐ Guardado"** y se añade a tu lista.
3. **Favoritos:** En la parte superior derecha hay un botón amarillo para "Ver Favoritos". Al tocarlo, se oculta la Pokédex y te muestra una lista con las fotos y nombres de los Pokémon que guardaste. 

Solo guarda este archivo, ve a la consola de Expo, presiona **`r`** y pruébalo en tu celular. ¡Es una app muchísimo más robusta y completa ahora!