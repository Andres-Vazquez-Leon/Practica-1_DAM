import { useState, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, TextInput, ScrollView, Modal } from 'react-native';
import { Image } from 'expo-image';

const POPULAR_SERVICES = [
  { id: 'github', name: 'GitHub', domain: 'github.com' },
  { id: 'amazon', name: 'Amazon', domain: 'amazon.com' },
  { id: 'apple', name: 'Apple', domain: 'apple.com' },
  { id: 'google', name: 'Google', domain: 'google.com' },
  { id: 'netflix', name: 'Netflix', domain: 'netflix.com' },
  { id: 'spotify', name: 'Spotify', domain: 'spotify.com' },
  { id: 'discord', name: 'Discord', domain: 'discord.com' },
  { id: 'slack', name: 'Slack', domain: 'slack.com' },
  { id: 'microsoft', name: 'Microsoft', domain: 'microsoft.com' },
  { id: 'twitter', name: 'X (Twitter)', domain: 'twitter.com' },
];

export default function Index() {
  const [favorites, setFavorites] = useState([]); 
  const [showFavorites, setShowFavorites] = useState(false);

  // Status service
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected service state
  const [selectedService, setSelectedService] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const filteredServices = useMemo(() => {
    return POPULAR_SERVICES.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const fetchServiceStatus = (service) => {
    setLoading(true);
    setSelectedService(service);
    setServiceData(null); // clear previous data
    
    fetch(`https://isitdownstatus.com/api/v1/status/${service.id}`)
      .then((res) => {
          if(!res.ok) {
              throw new Error("Error HTTP " + res.status);
          }
          return res.json();
      })
      .then((data) => {
        setServiceData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("API falló, usando datos simulados. Error original:", err);
        // Fallback (Mock)
        const isUp = Math.random() > 0.1; // 90% chance of being UP in mock
        const mockData = {
          service: service.id,
          status: isUp ? "UP" : "DOWN",
          status_code: isUp ? 200 : 503,
          response_time: Math.floor(Math.random() * 200) + 50 + "ms",
          message: "Datos simulados debido a limitación de la API.",
          timestamp: new Date().toISOString()
        };
        setServiceData(mockData);
        setLoading(false);
      });
  };

  const handleSearchCustom = () => {
    if (!searchQuery.trim()) return;
    const customService = {
       id: searchQuery.trim().toLowerCase(),
       name: searchQuery.trim(),
       domain: `${searchQuery.trim().toLowerCase()}.com`
    };
    fetchServiceStatus(customService);
  };

  const toggleFavorite = (service) => {
    if (!service) return;
    const isAlreadyFav = favorites.some(fav => fav.id === service.id);
    
    if (isAlreadyFav) {
      setFavorites(favorites.filter(fav => fav.id !== service.id));
    } else {
      setFavorites([...favorites, service]);
    }
  };

  const isCurrentFavorite = selectedService ? favorites.some(fav => fav.id === selectedService.id) : false;

  const renderServiceCard = (service) => (
    <Pressable 
      key={service.id} 
      style={styles.gridItem} 
      onPress={() => fetchServiceStatus(service)}
    >
      <Image 
        source={{ uri: `https://www.google.com/s2/favicons?domain=${service.domain}&sz=128` }} 
        style={styles.gridIcon} 
        contentFit="contain"
      />
      <Text style={styles.gridText} numberOfLines={1}>{service.name}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>IsItDown</Text>
        <Pressable 
            style={[styles.tabButton, showFavorites ? styles.tabButtonActive : null]} 
            onPress={() => setShowFavorites(!showFavorites)}
        >
          <Text style={[styles.tabButtonText, showFavorites ? styles.tabButtonTextActive : null]}>
            {showFavorites ? 'Ver Todos' : `Favoritos (${favorites.length})`}
          </Text>
        </Pressable>
      </View>

      {/* BODY */}
      <View style={styles.body}>
          {showFavorites ? (
             // FAVORITES VIEW
             <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Tus Servicios Guardados</Text>
                {favorites.length === 0 ? (
                    <Text style={styles.emptyText}>No tienes servicios favoritos aún.</Text>
                ) : (
                    <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
                        {favorites.map(renderServiceCard)}
                    </ScrollView>
                )}
             </View>
          ) : (
             // MAIN GRID VIEW
             <View style={{ flex: 1 }}>
                 {/* SEARCH BAR */}
                 <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar o escribir nombre (ej: github)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                    <Pressable style={styles.searchButton} onPress={handleSearchCustom}>
                        <Text style={styles.searchButtonText}>Buscar</Text>
                    </Pressable>
                 </View>

                 <Text style={styles.sectionTitle}>Servicios Populares</Text>
                 <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
                     {filteredServices.map(renderServiceCard)}
                     {filteredServices.length === 0 && (
                        <Text style={styles.emptyText}>No se encontró en la lista rápida.\nPresiona "Buscar" para consultarlo directamente.</Text>
                     )}
                 </ScrollView>
             </View>
          )}
      </View>

      {/* DETAIL MODAL */}
      <Modal 
        visible={!!selectedService} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedService(null)}
      >
          <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                  <Pressable style={styles.closeButton} onPress={() => setSelectedService(null)}>
                      <Text style={styles.closeButtonText}>✕ Cerrar</Text>
                  </Pressable>
                  <Pressable style={styles.modalFavButton} onPress={() => toggleFavorite(selectedService)}>
                      <Text style={styles.modalFavText}>
                          {isCurrentFavorite ? '⭐ Guardado' : '☆ Guardar'}
                      </Text>
                  </Pressable>
              </View>

              {loading || !serviceData || !selectedService ? (
                  <View style={styles.centerContent}>
                      <ActivityIndicator size="large" color="#0052cc" />
                      <Text style={styles.loadingText}>Verificando estado de {selectedService?.name}...</Text>
                  </View>
              ) : (
                  <View style={styles.detailContent}>
                      <Image 
                        source={{ uri: `https://www.google.com/s2/favicons?domain=${selectedService?.domain}&sz=128` }} 
                        style={styles.detailIcon} 
                        contentFit="contain"
                      />
                      <Text style={styles.detailName}>{selectedService?.name}</Text>
                      
                      <View style={[styles.statusBadge, serviceData.status === 'UP' ? styles.statusUp : styles.statusDown]}>
                          <Text style={[styles.statusBadgeText, serviceData.status === 'UP' ? styles.statusTextUp : styles.statusTextDown]}>
                              {serviceData.status === 'UP' ? 'OPERACIONAL' : 'CON PROBLEMAS'}
                          </Text>
                      </View>

                      <View style={styles.infoCard}>
                          <Text style={styles.infoLabel}>Estado Técnico:</Text>
                          <Text style={styles.infoValue}>{serviceData.status}</Text>
                          
                          <Text style={styles.infoLabel}>Código de Respuesta:</Text>
                          <Text style={styles.infoValue}>{serviceData.status_code || 'N/A'}</Text>
                          
                          <Text style={styles.infoLabel}>Tiempo de Respuesta:</Text>
                          <Text style={styles.infoValue}>{serviceData.response_time || 'N/A'}</Text>
                          
                          {serviceData.message && (
                              <>
                                <Text style={styles.infoLabel}>Mensaje:</Text>
                                <Text style={styles.infoValueMsg}>{serviceData.message}</Text>
                              </>
                          )}
                      </View>
                  </View>
              )}
          </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  tabButton: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#0052cc',
  },
  tabButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabButtonTextActive: {
    color: '#FFF',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#0052cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  gridIcon: {
    width: 60,
    height: 60,
    marginBottom: 12,
    borderRadius: 12,
  },
  gridText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 30,
    width: '100%',
  },
  // MODAL STYLES
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#FFF',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  modalFavButton: {
    backgroundColor: '#FFFBE6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  modalFavText: {
    color: '#B8860B',
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  detailContent: {
    flex: 1,
    alignItems: 'center',
    padding: 30,
  },
  detailIcon: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 20,
  },
  detailName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  statusBadge: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 40,
  },
  statusUp: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  statusDown: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  statusBadgeText: {
    fontWeight: '900',
    fontSize: 18,
  },
  statusTextUp: {
    color: '#2E7D32',
  },
  statusTextDown: {
    color: '#C62828',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginTop: 15,
  },
  infoValue: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
    marginTop: 5,
  },
  infoValueMsg: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 5,
    lineHeight: 22,
  },
});
