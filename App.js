import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Snackbar from 'react-native-snackbar';
import Icon from 'react-native-vector-icons/Ionicons';
import Background from './background.png';

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    padding: 24,
  },
  btn: {width: '50%', alignSelf: 'center', marginTop: 60},
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
  scrollView: {
    flexGrow: 1,
    minHeight: '100%',
  },
  cameraContainer: {
    minHeight: '100%',
  },
  img: {
    height: 120,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderWidth: 1,
    marginBottom: 6,
    borderRadius: 20,
    shadowOpacity: 1,
    borderColor: 'rgba(158, 150, 150, .5)',
  },
  rowText: {
    fontSize: 26,
    color: '#000',
  },
  columnTitle: {
    fontSize: 26,
    fontFamily: 'Cochin',
    color: '#fff',
    fontWeight: 'bold',
  },
  root: {height: '100%'},
  table: {
    paddingBottom: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  loader: {
    marginTop: '100%',
  },
  iconView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
});

const App = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [citiesList, setCitiesList] = useState([]);
  const [data, setData] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const API_key = 'd1ff912d6653094d48e33b45ee1530f8';

  const fetchTemp = async (city) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`,
    );
    const resJson = await response.json();

    try {
      return resJson.main.temp;
    } catch (e) {
      return resJson.message;
    }
  };

  const onSuccess = async (e) => {
    const res = await fetchTemp(e.data);

    if (typeof res === 'number') {
      await AsyncStorage.setItem(e.data, res.toString());
      fetchData();
      setIsScanning(false);
      Snackbar.show({
        text: `${e.data} added`,
        duration: Snackbar.LENGTH_LONG,
      });
    } else {
      setIsScanning(false);
      Snackbar.show({
        text: res,
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };

  const fetchData = useCallback(async () => {
    const keys = await AsyncStorage.getAllKeys();

    const details = {};
    for (let k of keys) {
      details[k] = await fetchTemp(k);
    }
    setData(details);
    setCitiesList(await AsyncStorage.getAllKeys());
    setIsLoading(false);
    setRefresh(false);
  }, []);

  const onRefresh = useCallback(() => {
    setRefresh(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <SafeAreaView style={styles.root}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => onRefresh()}
            />
          }>
          <ImageBackground style={styles.background} source={Background}>
            <StatusBar backgroundColor="blue" barStyle="dark-content" />
            <View style={styles.iconView}>
              <Icon
                name="refresh"
                size={32}
                color="#54D28D"
                onPress={() => onRefresh()}
                style={{marginRight: 8}}
              />
              <Icon
                name="ios-add-circle"
                size={34}
                color="#C93B1E"
                onPress={() => setIsScanning(true)}
              />
            </View>
            <View style={styles.body}>
              <View style={styles.table}>
                <Text style={styles.columnTitle}>City</Text>
                <Text style={styles.columnTitle}>Temperature(°C)</Text>
              </View>
              {citiesList.map((val, idx) => (
                <View key={idx} style={styles.row}>
                  <Text style={styles.rowText}>{val}</Text>
                  <Text style={styles.rowText}>{data[val].toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </ImageBackground>
        </ScrollView>
      )}
      {isScanning && (
        <QRCodeScanner
          onRead={onSuccess}
          bottomContent={
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={() => setIsScanning(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          }
          containerStyle={styles.cameraContainer}
        />
      )}
    </SafeAreaView>
  );
};

export default App;
