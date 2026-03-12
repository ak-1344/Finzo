import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { parseUPIQR } from '../../lib/upi';

export default function ScanQRScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    const upiData = parseUPIQR(result.data);
    if (!upiData) {
      Alert.alert(
        'Invalid QR',
        'This QR code is not a valid UPI payment QR. Please try again.',
        [
          {
            text: 'Scan Again',
            onPress: () => setScanned(false),
          },
          {
            text: 'Cancel',
            onPress: () => router.back(),
            style: 'cancel',
          },
        ]
      );
      return;
    }

    // Navigate to payment flow with parsed UPI data
    router.replace({
      pathname: '/payment/pay',
      params: {
        upiId: upiData.pa,
        payeeName: upiData.pn ?? '',
        amount: upiData.am ?? '',
        note: upiData.tn ?? '',
        fromQR: '1',
      },
    });
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-secondary">Loading camera...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-4xl mb-4">📷</Text>
        <Text className="text-text-primary text-lg font-bold text-center mb-2">
          Camera Permission Required
        </Text>
        <Text className="text-text-secondary text-sm text-center mb-6">
          We need camera access to scan UPI QR codes for payments.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary px-8 py-3 rounded-xl"
        >
          <Text className="text-white font-bold text-base">Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-8 py-3"
        >
          <Text className="text-text-secondary text-sm">Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay */}
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-base font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Scan QR</Text>
          <View className="w-12" />
        </View>

        {/* Center frame */}
        <View className="flex-1 items-center justify-center">
          <View className="w-64 h-64 border-2 border-white/60 rounded-2xl" />
          <Text className="text-white/80 text-sm mt-4">
            Point camera at a UPI QR code
          </Text>
        </View>

        {/* Bottom: manual entry option */}
        <View className="items-center pb-8">
          <TouchableOpacity
            onPress={() => {
              router.replace('/payment/pay');
            }}
            className="bg-white/20 px-6 py-3 rounded-full"
          >
            <Text className="text-white text-sm font-medium">
              Enter UPI ID manually →
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
