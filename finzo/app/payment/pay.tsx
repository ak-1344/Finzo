import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../hooks/useTransactions';
import { useBuckets } from '../../hooks/useBuckets';
import { useParties } from '../../hooks/useParties';
import { usePaymentStore } from '../../store/paymentStore';
import { isValidUPIId, openUPIPayment, getUPIApps, UPIAppName } from '../../lib/upi';
import { rupeesToPaise, formatRupees, paiseToRupees } from '../../lib/utils';
import { Bucket } from '../../types';

type Step = 'details' | 'bucket' | 'confirm' | 'result';

export default function PayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    upiId?: string;
    payeeName?: string;
    amount?: string;
    note?: string;
    fromQR?: string;
    partyId?: string;
  }>();

  const { addEntry } = useTransactions();
  const {
    activeBuckets,
    getRemaining,
    getUsagePercent,
    getHealthColor,
    spendFromBucket,
  } = useBuckets();
  const { getParty } = useParties();
  const { startPayment, confirmPayment, cancelPayment, pendingPayment } = usePaymentStore();

  // Form state
  const [upiId, setUpiId] = useState(params.upiId ?? '');
  const [payeeName, setPayeeName] = useState(params.payeeName ?? '');
  const [amount, setAmount] = useState(params.amount ?? '');
  const [label, setLabel] = useState(params.note ?? '');
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [selectedApp, setSelectedApp] = useState<UPIAppName>('Google Pay');
  const [step, setStep] = useState<Step>('details');
  const [upiOpened, setUpiOpened] = useState(false);

  const preselectedParty = params.partyId ? getParty(params.partyId) : undefined;

  // Check for pending payment recovery on mount
  useEffect(() => {
    if (pendingPayment && pendingPayment.status === 'pending') {
      // Recovered from a killed app mid-payment
      Alert.alert(
        'Pending Payment Found',
        `You had a ₹${paiseToRupees(pendingPayment.amount)} payment to ${pendingPayment.payeeName || pendingPayment.upiId}. Did it go through?`,
        [
          {
            text: 'Yes, it went through',
            onPress: () => handleConfirmPayment(),
          },
          {
            text: 'No, cancel it',
            onPress: () => {
              cancelPayment();
            },
          },
        ]
      );
    }
  }, []);

  // Listen for app returning from UPI app
  useEffect(() => {
    if (!upiOpened) return;

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' && upiOpened) {
        // User returned from UPI app
        setStep('result');
        setUpiOpened(false);
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [upiOpened]);

  const amountPaise = rupeesToPaise(parseFloat(amount) || 0);

  const goToStep2 = () => {
    if (!upiId.trim()) {
      Alert.alert('Missing UPI ID', 'Please enter a UPI ID or mobile number.');
      return;
    }
    if (!isValidUPIId(upiId.trim())) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. user@bank).');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    setStep('bucket');
  };

  const goToStep3 = () => {
    setStep('confirm');
  };

  const handlePay = async () => {
    // Save pending payment before opening UPI app (recovery if killed)
    startPayment({
      upiId: upiId.trim(),
      payeeName: payeeName.trim(),
      amount: amountPaise,
      label: label.trim() || `Payment to ${payeeName || upiId}`,
      bucketId: selectedBucket?.id ?? null,
      partyId: preselectedParty?.id ?? null,
      upiApp: selectedApp,
    });

    setUpiOpened(true);

    const opened = await openUPIPayment(
      {
        pa: upiId.trim(),
        pn: payeeName.trim() || undefined,
        am: amount,
        tn: label.trim() || undefined,
      },
      selectedApp
    );

    if (!opened) {
      setUpiOpened(false);
      Alert.alert(
        'UPI App Not Found',
        `Could not open ${selectedApp}. Make sure the app is installed.`,
        [
          { text: 'Try Another App', onPress: () => {} },
          {
            text: 'Log Manually',
            onPress: () => {
              handleConfirmPayment();
            },
          },
          {
            text: 'Cancel',
            onPress: () => {
              cancelPayment();
              router.back();
            },
          },
        ]
      );
    }
  };

  const handleConfirmPayment = () => {
    const payment = confirmPayment();
    if (!payment) {
      // Manual confirmation without pending store
      const amtPaise = amountPaise;
      addEntry({
        type: 'out',
        amount: amtPaise,
        label: label.trim() || `Payment to ${payeeName || upiId}`,
        bucketId: selectedBucket?.id ?? null,
        partyId: preselectedParty?.id ?? null,
        timestamp: Date.now(),
        paymentMethod: 'upi',
      });
      if (selectedBucket) {
        spendFromBucket(selectedBucket.id, amtPaise);
      }
    } else {
      // Log from confirmed pending payment
      addEntry({
        type: 'out',
        amount: payment.amount,
        label: payment.label,
        bucketId: payment.bucketId,
        partyId: payment.partyId,
        timestamp: Date.now(),
        paymentMethod: 'upi',
      });
      if (payment.bucketId) {
        spendFromBucket(payment.bucketId, payment.amount);
      }
    }

    Alert.alert('Payment Logged ✓', 'Entry added to your cashbook.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDeclinePayment = () => {
    cancelPayment();
    Alert.alert('Payment Cancelled', 'No entry was logged.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const upiApps = getUPIApps();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <TouchableOpacity onPress={() => { cancelPayment(); router.back(); }}>
            <Text className="text-primary text-base font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-text-primary text-lg font-bold">
            {step === 'details' && 'Pay'}
            {step === 'bucket' && 'Select Bucket'}
            {step === 'confirm' && 'Confirm Payment'}
            {step === 'result' && 'Payment Result'}
          </Text>
          <View className="w-12" />
        </View>

        {/* Step indicator */}
        <View className="flex-row px-5 mb-4 gap-2">
          {(['details', 'bucket', 'confirm'] as const).map((s, i) => (
            <View
              key={s}
              className={`flex-1 h-1 rounded-full ${
                step === s || (['details', 'bucket', 'confirm'].indexOf(step) > i) || step === 'result'
                  ? 'bg-primary'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 1: Payment Details */}
          {step === 'details' && (
            <View>
              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                UPI ID / Mobile Number
              </Text>
              <TextInput
                className="bg-card rounded-xl px-4 py-4 text-text-primary text-base border border-gray-200 mb-5"
                value={upiId}
                onChangeText={setUpiId}
                placeholder="e.g. user@ybl or 9876543210@upi"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Payee Name (Optional)
              </Text>
              <TextInput
                className="bg-card rounded-xl px-4 py-4 text-text-primary text-base border border-gray-200 mb-5"
                value={payeeName}
                onChangeText={setPayeeName}
                placeholder="e.g. Ramesh Shop"
                placeholderTextColor="#9CA3AF"
              />

              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Amount
              </Text>
              <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-gray-200 mb-5">
                <Text className="text-text-primary text-2xl font-bold mr-2">₹</Text>
                <TextInput
                  className="flex-1 text-2xl font-bold text-text-primary"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>

              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Note / Label (Optional)
              </Text>
              <TextInput
                className="bg-card rounded-xl px-4 py-4 text-text-primary text-base border border-gray-200 mb-6"
                value={label}
                onChangeText={setLabel}
                placeholder="e.g. Groceries, Dinner..."
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                onPress={goToStep2}
                className="bg-primary py-4 rounded-xl items-center"
              >
                <Text className="text-white text-base font-bold">
                  Next → Choose Bucket
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Bucket Selection */}
          {step === 'bucket' && (
            <View>
              <Text className="text-text-secondary text-sm mb-4">
                Select a bucket to deduct {formatRupees(amountPaise)} from:
              </Text>

              {/* No bucket option */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedBucket(null);
                }}
                className={`bg-card rounded-xl p-4 mb-2 border flex-row items-center ${
                  selectedBucket === null ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <Text className="text-xl mr-3">🏷️</Text>
                <View className="flex-1">
                  <Text className="text-text-primary text-sm font-medium">No Category</Text>
                  <Text className="text-text-muted text-xs">Don't deduct from any bucket</Text>
                </View>
                {selectedBucket === null && (
                  <Text className="text-primary font-bold">✓</Text>
                )}
              </TouchableOpacity>

              {activeBuckets.map((bucket) => {
                const remaining = getRemaining(bucket);
                const isLow = remaining < amountPaise;
                return (
                  <TouchableOpacity
                    key={bucket.id}
                    onPress={() => setSelectedBucket(bucket)}
                    className={`bg-card rounded-xl p-4 mb-2 border flex-row items-center ${
                      selectedBucket?.id === bucket.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200'
                    }`}
                  >
                    <Text className="text-xl mr-3">{bucket.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-text-primary text-sm font-medium">
                        {bucket.name}
                      </Text>
                      <Text className={`text-xs ${isLow ? 'text-danger' : 'text-text-muted'}`}>
                        {formatRupees(remaining)} remaining
                      </Text>
                    </View>
                    {isLow && (
                      <Text className="text-warning text-xs mr-2">⚠️ Low</Text>
                    )}
                    {selectedBucket?.id === bucket.id && (
                      <Text className="text-primary font-bold">✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Low balance warning */}
              {selectedBucket && getRemaining(selectedBucket) < amountPaise && (
                <View className="bg-warning/10 rounded-xl p-3 mt-2 mb-4">
                  <Text className="text-warning text-sm">
                    ⚠️ {selectedBucket.name} only has{' '}
                    {formatRupees(getRemaining(selectedBucket))}. You're paying{' '}
                    {formatRupees(amountPaise)}.
                  </Text>
                </View>
              )}

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => setStep('details')}
                  className="flex-1 py-4 rounded-xl items-center border border-gray-200"
                >
                  <Text className="text-text-secondary text-base font-medium">← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={goToStep3}
                  className="flex-1 bg-primary py-4 rounded-xl items-center"
                >
                  <Text className="text-white text-base font-bold">Next →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: Confirm & Pay */}
          {step === 'confirm' && (
            <View>
              {/* Summary Card */}
              <View className="bg-card rounded-2xl p-5 border border-gray-200 mb-5">
                <Text className="text-text-muted text-xs uppercase tracking-wider mb-3">
                  Payment Summary
                </Text>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-text-secondary text-sm">To</Text>
                  <Text className="text-text-primary text-sm font-medium">
                    {payeeName || upiId}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-text-secondary text-sm">UPI ID</Text>
                  <Text className="text-text-primary text-sm font-medium">{upiId}</Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-text-secondary text-sm">Amount</Text>
                  <Text className="text-danger text-lg font-bold">
                    {formatRupees(amountPaise)}
                  </Text>
                </View>

                {selectedBucket && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-text-secondary text-sm">Bucket</Text>
                    <Text className="text-text-primary text-sm font-medium">
                      {selectedBucket.icon} {selectedBucket.name}
                    </Text>
                  </View>
                )}

                {label.trim() && (
                  <View className="flex-row justify-between">
                    <Text className="text-text-secondary text-sm">Note</Text>
                    <Text className="text-text-primary text-sm">{label}</Text>
                  </View>
                )}
              </View>

              {/* Choose UPI App */}
              <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                Pay With
              </Text>
              <View className="flex-row gap-2 mb-6 flex-wrap">
                {upiApps.map((app) => (
                  <TouchableOpacity
                    key={app.name}
                    onPress={() => setSelectedApp(app.name)}
                    className={`py-3 px-4 rounded-xl border ${
                      selectedApp === app.name
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card border-gray-200'
                    }`}
                  >
                    <Text className="text-sm">
                      {app.emoji}{' '}
                      <Text
                        className={
                          selectedApp === app.name
                            ? 'text-primary font-medium'
                            : 'text-text-secondary'
                        }
                      >
                        {app.name}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setStep('bucket')}
                  className="flex-1 py-4 rounded-xl items-center border border-gray-200"
                >
                  <Text className="text-text-secondary text-base font-medium">← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePay}
                  className="flex-1 bg-success py-4 rounded-xl items-center"
                >
                  <Text className="text-white text-base font-bold">
                    Pay {formatRupees(amountPaise)} →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 4: Result — Did it go through? */}
          {step === 'result' && (
            <View className="items-center pt-8">
              <Text className="text-5xl mb-4">🤔</Text>
              <Text className="text-text-primary text-xl font-bold text-center mb-2">
                Did your payment go through?
              </Text>
              <Text className="text-text-secondary text-sm text-center mb-8 px-4">
                {formatRupees(amountPaise)} to {payeeName || upiId}
              </Text>

              <TouchableOpacity
                onPress={handleConfirmPayment}
                className="bg-success w-full py-4 rounded-xl items-center mb-3"
              >
                <Text className="text-white text-base font-bold">
                  ✓ Yes, payment successful
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeclinePayment}
                className="bg-danger w-full py-4 rounded-xl items-center mb-3"
              >
                <Text className="text-white text-base font-bold">
                  ✗ No, it didn't go through
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePay}
                className="w-full py-4 rounded-xl items-center border border-gray-200"
              >
                <Text className="text-text-secondary text-base font-medium">
                  🔄 Try again with different app
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
