import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import WalletCard from './components/WalletCard';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';

const PAYMENT_TYPES = [
  { id: 'card', name: 'Debit/Credit Card', icon: 'card', color: COLORS.primary },
  { id: 'paypal', name: 'PayPal', icon: 'logo-paypal', color: '#0070BA' },
  { id: 'cashapp', name: 'Cash App', icon: 'cash', color: '#00D632' },
  { id: 'chime', name: 'Chime', icon: 'wallet', color: '#00D64F' },
  { id: 'applepay', name: 'Apple Pay', icon: 'logo-apple', color: COLORS.textPrimary },
  { id: 'bank', name: 'Bank Account', icon: 'business', color: COLORS.secondary },
];

const ADD_AMOUNTS = [10, 25, 50, 100, 250, 500];
const PAYOUT_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export default function WalletScreen() {
  const router = useRouter();
  const { wallet, transactions, updateWallet, addTransaction } = useApp();
  const { profile, paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod, receipts, addFunds, requestPayout } = useAuth();
  
  const [showHistory, setShowHistory] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedPayoutPreset, setSelectedPayoutPreset] = useState<number | null>(null);
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Bank details
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const quickActions = [
    { icon: 'send', label: 'Send', color: COLORS.primary, route: '/p2p' },
    { icon: 'download', label: 'Request', color: COLORS.success, route: '/p2p' },
    { icon: 'gift', label: 'Sponsor', color: COLORS.gold, route: '/sponsor' },
    { icon: 'storefront', label: 'Store', color: COLORS.secondary, route: '/store' },
  ];

  const services = [
    { icon: 'mic', label: 'Book Demo', price: 100, route: '/demo' },
    { icon: 'videocam', label: 'Live Tour', price: 100, route: '/livetour', premium: true },
    { icon: 'musical-notes', label: 'Music Booth', price: 0, route: '/booth' },
    { icon: 'cart', label: 'Sell Music', price: 0, route: '/sell', premium: true },
  ];

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleAddFundsConfirm = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    const defaultMethod = paymentMethods.find(m => m.isDefault);
    if (!defaultMethod) {
      Alert.alert('No Payment Method', 'Please add a payment method first');
      return;
    }

    await addFunds(amount, defaultMethod.id);
    updateWallet(amount);
    addTransaction({ type: 'receive', amount, fee: 0, description: `Added funds via ${defaultMethod.name}` });
    setShowAddFunds(false);
    setCustomAmount('');
    Alert.alert('Success', `$${amount.toFixed(2)} has been added to your wallet`);
  };

  const handleAddPaymentMethod = () => {
    if (!selectedPaymentType) {
      Alert.alert('Select Type', 'Please select a payment method type');
      return;
    }

    const type = PAYMENT_TYPES.find(t => t.id === selectedPaymentType);
    
    if (selectedPaymentType === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!cardCVV || cardCVV.length < 3) {
        Alert.alert('Invalid CVV', 'Please enter a valid CVV');
        return;
      }
      if (!cardName.trim()) {
        Alert.alert('Invalid Name', 'Please enter the cardholder name');
        return;
      }
    }

    if (selectedPaymentType === 'bank') {
      if (!routingNumber || routingNumber.length < 9) {
        Alert.alert('Invalid Routing', 'Please enter a valid 9-digit routing number');
        return;
      }
      if (!accountNumber || accountNumber.length < 8) {
        Alert.alert('Invalid Account', 'Please enter a valid account number');
        return;
      }
      if (!accountName.trim()) {
        Alert.alert('Invalid Name', 'Please enter the account holder name');
        return;
      }
    }

    addPaymentMethod({
      type: selectedPaymentType as any,
      name: selectedPaymentType === 'card' ? `${type?.name} ****${cardNumber.slice(-4)}` : 
            selectedPaymentType === 'bank' ? `Bank ****${accountNumber.slice(-4)}` : type?.name || 'Payment Method',
      last4: selectedPaymentType === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : 
             selectedPaymentType === 'bank' ? accountNumber.slice(-4) : undefined,
      isDefault: paymentMethods.length === 0,
    });

    // Reset form
    setShowAddPayment(false);
    setSelectedPaymentType(null);
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardName('');
    setRoutingNumber('');
    setAccountNumber('');
    setAccountName('');
    Alert.alert('Success', 'Payment method added successfully! You can now receive payouts to this account.');
  };

  const handlePayout = async () => {
    const amount = payoutAmount ? parseFloat(payoutAmount) : selectedPayoutPreset || 0;
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    if (amount > wallet.balance) {
      Alert.alert('Insufficient Funds', 'You cannot withdraw more than your balance');
      return;
    }
    if (amount < 10) {
      Alert.alert('Minimum Payout', 'Minimum payout amount is $10');
      return;
    }

    const payoutMethod = selectedPayoutMethod 
      ? paymentMethods.find(m => m.id === selectedPayoutMethod)
      : paymentMethods.find(m => m.isDefault);
      
    if (!payoutMethod) {
      Alert.alert('No Payment Method', 'Please add a debit card or bank account for payouts');
      return;
    }

    const fee = amount * 0.02;
    const netAmount = amount - fee;
    
    Alert.alert(
      'Confirm Payout',
      `Amount: $${amount.toFixed(2)}\nFee (2%): $${fee.toFixed(2)}\nYou'll receive: $${netAmount.toFixed(2)}\n\nPayout to: ${payoutMethod.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            await requestPayout(amount, payoutMethod.id);
            updateWallet(-amount);
            addTransaction({ type: 'send', amount, fee, description: `Instant payout to ${payoutMethod.name}` });
            setShowPayout(false);
            setPayoutAmount('');
            setSelectedPayoutPreset(null);
            Alert.alert(
              'Payout Initiated!', 
              `$${netAmount.toFixed(2)} will be sent to your ${payoutMethod.name}.\n\nExpected arrival: 1-3 business days for bank accounts, instant for debit cards.`
            );
          }
        }
      ]
    );
  };

  const isPremium = profile?.isPremium;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowReceipts(true)}>
            <Ionicons name="receipt" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddFunds(true)}>
            <Ionicons name="add-circle" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <WalletCard balance={wallet.balance} credits={wallet.credits} frozen={wallet.frozen} />

        {wallet.frozen && (
          <View style={styles.frozenBanner}>
            <Ionicons name="warning" size={20} color={COLORS.error} />
            <Text style={styles.frozenText}>Account frozen - Pay ${wallet.credits} to unfreeze</Text>
          </View>
        )}

        {isPremium && (
          <View style={styles.infiniteCard}>
            <Ionicons name="infinite" size={24} color={COLORS.gold} />
            <View style={styles.infiniteContent}>
              <Text style={styles.infiniteTitle}>1Way Infinite Money Account</Text>
              <Text style={styles.infiniteDesc}>Unlimited earnings potential unlocked</Text>
            </View>
          </View>
        )}

        <View style={styles.balanceActions}>
          <TouchableOpacity style={styles.balanceAction} onPress={() => setShowAddFunds(true)}>
            <Ionicons name="add" size={20} color={COLORS.success} />
            <Text style={styles.balanceActionText}>Add Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.balanceAction, styles.payoutAction]} onPress={() => setShowPayout(true)}>
            <Ionicons name="arrow-up" size={20} color={COLORS.textPrimary} />
            <Text style={styles.balanceActionText}>Cash Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <Text style={styles.sectionSubtitle}>Add cards and bank accounts to receive payouts</Text>
        
        {paymentMethods.length === 0 ? (
          <TouchableOpacity style={styles.addPaymentCard} onPress={() => setShowAddPayment(true)}>
            <Ionicons name="add-circle" size={32} color={COLORS.primary} />
            <Text style={styles.addPaymentText}>Add Debit Card or Bank Account</Text>
            <Text style={styles.addPaymentSubtext}>Required to cash out your earnings</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map(method => (
              <TouchableOpacity 
                key={method.id} 
                style={[styles.paymentMethod, method.isDefault && styles.paymentMethodDefault]}
                onPress={() => setDefaultPaymentMethod(method.id)}
                onLongPress={() => {
                  Alert.alert('Remove Payment Method', `Remove ${method.name}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removePaymentMethod(method.id) }
                  ]);
                }}
              >
                <Ionicons name={PAYMENT_TYPES.find(t => t.id === method.type)?.icon as any || 'card'} size={24} color={PAYMENT_TYPES.find(t => t.id === method.type)?.color || COLORS.primary} />
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  {method.last4 && <Text style={styles.paymentMethodLast4}>****{method.last4}</Text>}
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addMorePayment} onPress={() => setShowAddPayment(true)}>
              <Ionicons name="add" size={20} color={COLORS.primary} />
              <Text style={styles.addMoreText}>Add Another</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Quick Actions (Free)</Text>
        <View style={styles.quickActions}>
          {quickActions.map(action => (
            <TouchableOpacity key={action.label} style={styles.quickAction} onPress={() => router.push(action.route as any)}>
              <View style={[styles.quickIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon as any} size={24} color={COLORS.textPrimary} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Services</Text>
        {services.map(service => (
          <TouchableOpacity 
            key={service.label} 
            style={[styles.serviceItem, service.premium && !isPremium && styles.serviceDisabled]} 
            onPress={() => {
              if (service.premium && !isPremium) {
                Alert.alert('Premium Required', 'Upgrade to Premium to access this feature', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Upgrade', onPress: () => router.push('/premium') }
                ]);
              } else {
                router.push(service.route as any);
              }
            }}
          >
            <View style={styles.serviceIcon}>
              <Ionicons name={service.icon as any} size={24} color={service.premium && !isPremium ? COLORS.textMuted : COLORS.primary} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceName, service.premium && !isPremium && styles.serviceNameDisabled]}>{service.label}</Text>
              <Text style={styles.servicePrice}>{service.price > 0 ? `$${service.price}` : 'Free'}</Text>
            </View>
            {service.premium && !isPremium && (
              <View style={styles.premiumTag}>
                <Text style={styles.premiumTagText}>PREMIUM</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.historyToggle} onPress={() => setShowHistory(!showHistory)}>
          <Text style={styles.historyTitle}>Transaction History</Text>
          <Ionicons name={showHistory ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {showHistory && (
          <View style={styles.historyList}>
            {transactions.length === 0 ? (
              <Text style={styles.noHistory}>No transactions yet</Text>
            ) : (
              transactions.slice(-10).reverse().map(tx => (
                <View key={tx.id} style={styles.txItem}>
                  <Ionicons name={tx.type === 'receive' || tx.type === 'sale' ? 'arrow-down' : 'arrow-up'} size={20} color={tx.type === 'receive' || tx.type === 'sale' ? COLORS.success : COLORS.error} />
                  <View style={styles.txInfo}>
                    <Text style={styles.txDesc}>{tx.description}</Text>
                    <Text style={styles.txDate}>{new Date(tx.timestamp).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: tx.type === 'receive' || tx.type === 'sale' ? COLORS.success : COLORS.error }]}>
                    {tx.type === 'receive' || tx.type === 'sale' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        <View style={styles.feeNote}>
          <Ionicons name="information-circle" size={16} color={COLORS.textMuted} />
          <Text style={styles.feeText}>20¢ fee per $1 on sales (Ghost writing, Features, Demos, Videos). 2% fee on instant payouts. Minimum payout: $10.</Text>
        </View>
      </ScrollView>

      {/* Add Funds Modal */}
      <Modal visible={showAddFunds} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Funds</Text>
              <TouchableOpacity onPress={() => setShowAddFunds(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.amountGrid}>
              {ADD_AMOUNTS.map(amount => (
                <TouchableOpacity 
                  key={amount} 
                  style={[styles.amountBtn, selectedAmount === amount && !customAmount && styles.amountBtnActive]}
                  onPress={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                >
                  <Text style={[styles.amountText, selectedAmount === amount && !customAmount && styles.amountTextActive]}>${amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customAmountContainer}>
              <Text style={styles.customLabel}>Or enter custom amount:</Text>
              <TextInput
                style={styles.customInput}
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="$0.00"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
              />
            </View>

            {paymentMethods.length > 0 && (
              <View style={styles.selectedPayment}>
                <Text style={styles.payingWith}>Paying with:</Text>
                <Text style={styles.paymentName}>{paymentMethods.find(m => m.isDefault)?.name || 'Default Card'}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.confirmBtn} onPress={handleAddFundsConfirm}>
              <Text style={styles.confirmBtnText}>Add ${customAmount || selectedAmount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal visible={showAddPayment} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setShowAddPayment(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.paymentTypesList}>
              <Text style={styles.paymentSectionLabel}>Select Type</Text>
              {PAYMENT_TYPES.map(type => (
                <TouchableOpacity 
                  key={type.id}
                  style={[styles.paymentTypeItem, selectedPaymentType === type.id && styles.paymentTypeActive]}
                  onPress={() => setSelectedPaymentType(type.id)}
                >
                  <Ionicons name={type.icon as any} size={24} color={type.color} />
                  <Text style={styles.paymentTypeName}>{type.name}</Text>
                  {selectedPaymentType === type.id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  )}
                </TouchableOpacity>
              ))}

              {selectedPaymentType === 'card' && (
                <View style={styles.cardForm}>
                  <Text style={styles.formSectionLabel}>Card Details</Text>
                  <TextInput
                    style={styles.cardInput}
                    value={cardNumber}
                    onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                    placeholder="Card Number"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                  <View style={styles.cardRow}>
                    <TextInput
                      style={[styles.cardInput, { flex: 1 }]}
                      value={cardExpiry}
                      onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                      placeholder="MM/YY"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                    <TextInput
                      style={[styles.cardInput, { flex: 1 }]}
                      value={cardCVV}
                      onChangeText={setCardCVV}
                      placeholder="CVV"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                  <TextInput
                    style={styles.cardInput}
                    value={cardName}
                    onChangeText={setCardName}
                    placeholder="Cardholder Name"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="words"
                  />
                </View>
              )}

              {selectedPaymentType === 'bank' && (
                <View style={styles.cardForm}>
                  <Text style={styles.formSectionLabel}>Bank Account Details</Text>
                  <TextInput
                    style={styles.cardInput}
                    value={routingNumber}
                    onChangeText={setRoutingNumber}
                    placeholder="Routing Number (9 digits)"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    maxLength={9}
                  />
                  <TextInput
                    style={styles.cardInput}
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    placeholder="Account Number"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                  />
                  <TextInput
                    style={styles.cardInput}
                    value={accountName}
                    onChangeText={setAccountName}
                    placeholder="Account Holder Name"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="words"
                  />
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleAddPaymentMethod}>
              <Text style={styles.confirmBtnText}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cash Out / Payout Modal */}
      <Modal visible={showPayout} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cash Out</Text>
              <TouchableOpacity onPress={() => setShowPayout(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.payoutBalance}>
              <Text style={styles.payoutLabel}>Available Balance</Text>
              <Text style={styles.payoutValue}>${wallet.balance.toFixed(2)}</Text>
            </View>

            <Text style={styles.payoutSectionLabel}>Select Amount</Text>
            <View style={styles.amountGrid}>
              {PAYOUT_AMOUNTS.filter(a => a <= wallet.balance).map(amount => (
                <TouchableOpacity 
                  key={amount} 
                  style={[styles.amountBtn, selectedPayoutPreset === amount && !payoutAmount && styles.amountBtnActive]}
                  onPress={() => { setSelectedPayoutPreset(amount); setPayoutAmount(''); }}
                >
                  <Text style={[styles.amountText, selectedPayoutPreset === amount && !payoutAmount && styles.amountTextActive]}>${amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.customLabel}>Or enter custom amount:</Text>
            <TextInput
              style={styles.payoutInput}
              value={payoutAmount}
              onChangeText={(text) => { setPayoutAmount(text); setSelectedPayoutPreset(null); }}
              placeholder="Enter amount"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
            />

            {paymentMethods.length > 0 && (
              <>
                <Text style={styles.payoutSectionLabel}>Cash Out To</Text>
                {paymentMethods.map(method => (
                  <TouchableOpacity 
                    key={method.id}
                    style={[
                      styles.payoutMethodItem, 
                      (selectedPayoutMethod === method.id || (!selectedPayoutMethod && method.isDefault)) && styles.payoutMethodActive
                    ]}
                    onPress={() => setSelectedPayoutMethod(method.id)}
                  >
                    <Ionicons name={PAYMENT_TYPES.find(t => t.id === method.type)?.icon as any || 'card'} size={20} color={COLORS.primary} />
                    <Text style={styles.payoutMethodName}>{method.name}</Text>
                    {(selectedPayoutMethod === method.id || (!selectedPayoutMethod && method.isDefault)) && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}

            <View style={styles.feeInfo}>
              <Ionicons name="information-circle" size={16} color={COLORS.textMuted} />
              <Text style={styles.feeInfoText}>2% fee applies to instant payouts. Minimum: $10</Text>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handlePayout}>
              <Ionicons name="arrow-up" size={20} color={COLORS.textPrimary} />
              <Text style={styles.confirmBtnText}>Cash Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Receipts Modal */}
      <Modal visible={showReceipts} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Receipts</Text>
              <TouchableOpacity onPress={() => setShowReceipts(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.receiptsList}>
              {receipts.length === 0 ? (
                <Text style={styles.noReceipts}>No receipts yet</Text>
              ) : (
                receipts.slice().reverse().map(receipt => (
                  <View key={receipt.id} style={styles.receiptItem}>
                    <View style={styles.receiptHeader}>
                      <Text style={styles.receiptType}>{receipt.type.toUpperCase()}</Text>
                      <Text style={[styles.receiptStatus, receipt.status === 'completed' ? styles.statusCompleted : styles.statusPending]}>
                        {receipt.status}
                      </Text>
                    </View>
                    <Text style={styles.receiptDesc}>{receipt.description}</Text>
                    <View style={styles.receiptFooter}>
                      <Text style={styles.receiptDate}>{new Date(receipt.timestamp).toLocaleString()}</Text>
                      <Text style={styles.receiptAmount}>${receipt.amount.toFixed(2)}</Text>
                    </View>
                    {receipt.fee > 0 && (
                      <Text style={styles.receiptFee}>Fee: ${receipt.fee.toFixed(2)}</Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <MiniPlayer />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerActions: { flexDirection: 'row', gap: 16 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textPrimary },
  content: { padding: 20, paddingBottom: 180 },
  frozenBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.2)', padding: 12, borderRadius: 12, marginTop: 16 },
  frozenText: { color: COLORS.error, flex: 1 },
  infiniteCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(234,179,8,0.1)', padding: 16, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: COLORS.gold },
  infiniteContent: { flex: 1 },
  infiniteTitle: { color: COLORS.gold, fontWeight: '700', fontSize: 16 },
  infiniteDesc: { color: COLORS.textMuted, fontSize: 13 },
  balanceActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  balanceAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.backgroundCard, paddingVertical: 14, borderRadius: 12 },
  payoutAction: { backgroundColor: COLORS.primary },
  balanceActionText: { color: COLORS.textPrimary, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 24, marginBottom: 4 },
  sectionSubtitle: { color: COLORS.textMuted, fontSize: 13, marginBottom: 12 },
  addPaymentCard: { backgroundColor: COLORS.backgroundCard, padding: 24, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.primary },
  addPaymentText: { color: COLORS.primary, fontWeight: '600', marginTop: 8 },
  addPaymentSubtext: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  paymentMethodsList: { gap: 8 },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginBottom: 8 },
  paymentMethodDefault: { borderWidth: 1, borderColor: COLORS.primary },
  paymentMethodInfo: { flex: 1, marginLeft: 12 },
  paymentMethodName: { color: COLORS.textPrimary, fontWeight: '600' },
  paymentMethodLast4: { color: COLORS.textMuted, fontSize: 13 },
  defaultBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  defaultBadgeText: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '700' },
  addMorePayment: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  addMoreText: { color: COLORS.primary, fontWeight: '600' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { alignItems: 'center' },
  quickIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { color: COLORS.textSecondary, fontSize: 12, marginTop: 8 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginBottom: 8 },
  serviceDisabled: { opacity: 0.6 },
  serviceIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.backgroundLight, justifyContent: 'center', alignItems: 'center' },
  serviceInfo: { flex: 1, marginLeft: 12 },
  serviceName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  serviceNameDisabled: { color: COLORS.textMuted },
  servicePrice: { color: COLORS.success, fontSize: 14 },
  premiumTag: { backgroundColor: COLORS.gold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 8 },
  premiumTagText: { color: COLORS.background, fontSize: 10, fontWeight: '700' },
  historyToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingVertical: 12 },
  historyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  historyList: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 12 },
  noHistory: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20 },
  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.backgroundLight },
  txInfo: { flex: 1, marginLeft: 12 },
  txDesc: { color: COLORS.textPrimary, fontSize: 14 },
  txDate: { color: COLORS.textMuted, fontSize: 12 },
  txAmount: { fontSize: 16, fontWeight: '700' },
  feeNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 24, padding: 12, backgroundColor: COLORS.backgroundCard, borderRadius: 12 },
  feeText: { color: COLORS.textMuted, fontSize: 12, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amountBtn: { width: '30%', backgroundColor: COLORS.backgroundCard, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  amountBtnActive: { backgroundColor: COLORS.primary },
  amountText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  amountTextActive: { color: COLORS.textPrimary },
  customAmountContainer: { marginTop: 20 },
  customLabel: { color: COLORS.textMuted, marginBottom: 8 },
  customInput: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, fontSize: 18 },
  selectedPayment: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  payingWith: { color: COLORS.textMuted },
  paymentName: { color: COLORS.primary, fontWeight: '600', marginLeft: 8 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, marginTop: 20, marginBottom: 20 },
  confirmBtnText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  paymentTypesList: { maxHeight: 400 },
  paymentSectionLabel: { color: COLORS.textMuted, fontSize: 14, marginBottom: 12 },
  paymentTypeItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginBottom: 8 },
  paymentTypeActive: { borderWidth: 1, borderColor: COLORS.primary },
  paymentTypeName: { flex: 1, color: COLORS.textPrimary, fontSize: 16, marginLeft: 12 },
  cardForm: { marginTop: 16 },
  formSectionLabel: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  cardInput: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, fontSize: 16, marginBottom: 12 },
  cardRow: { flexDirection: 'row', gap: 12 },
  payoutBalance: { alignItems: 'center', marginBottom: 20 },
  payoutLabel: { color: COLORS.textMuted },
  payoutValue: { color: COLORS.textPrimary, fontSize: 32, fontWeight: '800' },
  payoutSectionLabel: { color: COLORS.textMuted, fontSize: 14, marginTop: 16, marginBottom: 8 },
  payoutInput: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, fontSize: 24, textAlign: 'center' },
  payoutMethodItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 12, borderRadius: 12, marginBottom: 8 },
  payoutMethodActive: { borderWidth: 1, borderColor: COLORS.primary },
  payoutMethodName: { flex: 1, color: COLORS.textPrimary, marginLeft: 12 },
  feeInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  feeInfoText: { color: COLORS.textMuted, fontSize: 13 },
  receiptsList: { maxHeight: 400 },
  noReceipts: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: 40 },
  receiptItem: { backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginBottom: 12 },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptType: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  receiptStatus: { fontSize: 12, fontWeight: '600' },
  statusCompleted: { color: COLORS.success },
  statusPending: { color: COLORS.gold },
  receiptDesc: { color: COLORS.textPrimary, marginTop: 8 },
  receiptFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  receiptDate: { color: COLORS.textMuted, fontSize: 12 },
  receiptAmount: { color: COLORS.textPrimary, fontWeight: '700' },
  receiptFee: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
});
