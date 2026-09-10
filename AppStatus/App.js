import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';

export default function App() {
  const [servicio, setServicio] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const buscarStatus = async () => {
    if (!servicio.trim()) return;

    Keyboard.dismiss();
    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const nombreServicio = servicio.trim().toLowerCase();
      console.log("🔍 Intentando buscar:", nombreServicio);
      
      const url = `https://isitdownstatus.com/api/v1/status/${nombreServicio}`;
      console.log("🌐 URL generada:", url);

      // Petición con Headers para evitar que la API nos bloquee
      const respuesta = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log("📡 Status HTTP de respuesta:", respuesta.status);
      
      if (!respuesta.ok) {
        throw new Error(`Fallo en el servidor (Código: ${respuesta.status})`);
      }

      const datos = await respuesta.json();
      console.log("✅ Datos recibidos correctamente");
      setResultado(datos.data);
      
    } catch (err) {
      console.log("❌ Error capturado:", err.message);
      setError("No se encontró el servicio o hay error de red.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Monitor de Servicios TI</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Ej. github, amazon, netflix..."
        value={servicio}
        onChangeText={setServicio}
        autoCapitalize="none"
      />
      
      <TouchableOpacity style={styles.boton} onPress={buscarStatus}>
        <Text style={styles.textoBoton}>Consultar Status</Text>
      </TouchableOpacity>

      {/* Rueda de carga mientras esperamos la API */}
      {cargando && <ActivityIndicator size="large" color="#007bff" style={styles.loader} />}

      {/* Mensaje si hay error */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Tarjeta con los resultados exitosos */}
      {resultado && (
        <View style={styles.tarjeta}>
          <Text style={styles.texto}>Servicio: <Text style={styles.bold}>{resultado.name}</Text></Text>
          <Text style={styles.texto}>Categoría: {resultado.category}</Text>
          <Text style={styles.texto}>Estado actual: <Text style={styles.bold}>{resultado.status}</Text></Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  boton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' },
  textoBoton: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 20 },
  error: { color: 'red', marginTop: 20, textAlign: 'center', fontSize: 16 },
  tarjeta: { marginTop: 20, padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  texto: { fontSize: 16, marginBottom: 8, color: '#444' },
  bold: { fontWeight: 'bold', color: '#000' }
});