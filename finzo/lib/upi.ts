import { Linking, Platform } from 'react-native';

/**
 * Parsed UPI QR code data.
 */
export interface UPIData {
  pa: string;  // Payee address (UPI ID)
  pn?: string; // Payee name
  am?: string; // Amount
  tn?: string; // Transaction note
  cu?: string; // Currency (default INR)
  mc?: string; // Merchant code
}

/**
 * Parse a UPI QR code string into structured data.
 * UPI QR format: upi://pay?pa=merchant@upi&pn=Merchant&am=100&tn=Payment
 */
export function parseUPIQR(qrData: string): UPIData | null {
  try {
    // Normalize and check prefix
    const trimmed = qrData.trim();
    if (!trimmed.toLowerCase().startsWith('upi://pay')) {
      return null;
    }

    const url = new URL(trimmed);
    const params = url.searchParams;

    const pa = params.get('pa');
    if (!pa) return null; // UPI ID is required

    return {
      pa,
      pn: params.get('pn') ?? undefined,
      am: params.get('am') ?? undefined,
      tn: params.get('tn') ?? undefined,
      cu: params.get('cu') ?? 'INR',
      mc: params.get('mc') ?? undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Validate a UPI ID format (e.g. user@bank, 9876543210@ybl).
 */
export function isValidUPIId(upiId: string): boolean {
  // UPI ID format: string@string (alphanumeric + dots)
  return /^[\w.\-]+@[\w.\-]+$/.test(upiId.trim());
}

/**
 * Build a UPI deeplink URL.
 */
export function buildUPIDeeplink(params: {
  pa: string;
  pn?: string;
  am: string;
  tn?: string;
  cu?: string;
}): string {
  const query = new URLSearchParams();
  query.set('pa', params.pa);
  if (params.pn) query.set('pn', params.pn);
  query.set('am', params.am);
  if (params.tn) query.set('tn', params.tn);
  query.set('cu', params.cu ?? 'INR');

  return `upi://pay?${query.toString()}`;
}

/**
 * Known UPI app package names / URL schemes.
 */
const UPI_APPS = [
  {
    name: 'Google Pay',
    emoji: '💳',
    // GPay uses tez:// on Android, gpay:// on iOS
    androidPackage: 'com.google.android.apps.nbu.paisa.user',
    getUrl: (baseUrl: string) =>
      Platform.OS === 'android'
        ? `tez://upi/pay?${baseUrl.split('?')[1]}`
        : baseUrl,
  },
  {
    name: 'PhonePe',
    emoji: '📲',
    androidPackage: 'com.phonepe.app',
    getUrl: (baseUrl: string) =>
      Platform.OS === 'android'
        ? `phonepe://pay?${baseUrl.split('?')[1]}`
        : baseUrl,
  },
  {
    name: 'Paytm',
    emoji: '💰',
    androidPackage: 'net.one97.paytm',
    getUrl: (baseUrl: string) =>
      Platform.OS === 'android'
        ? `paytmmp://pay?${baseUrl.split('?')[1]}`
        : baseUrl,
  },
] as const;

export type UPIAppName = 'Google Pay' | 'PhonePe' | 'Paytm' | 'Other UPI';

/**
 * Get available UPI apps list (for UI display).
 */
export function getUPIApps() {
  return [
    ...UPI_APPS.map((app) => ({
      name: app.name as UPIAppName,
      emoji: app.emoji,
    })),
    { name: 'Other UPI' as UPIAppName, emoji: '🏦' },
  ];
}

/**
 * Open a UPI payment in the specified app.
 * Falls back to generic upi:// scheme.
 */
export async function openUPIPayment(
  params: { pa: string; pn?: string; am: string; tn?: string },
  preferredApp?: UPIAppName
): Promise<boolean> {
  const genericUrl = buildUPIDeeplink(params);

  // If a specific app is chosen, try its scheme first
  if (preferredApp && preferredApp !== 'Other UPI') {
    const app = UPI_APPS.find((a) => a.name === preferredApp);
    if (app) {
      const appUrl = app.getUrl(genericUrl);
      try {
        const canOpen = await Linking.canOpenURL(appUrl);
        if (canOpen) {
          await Linking.openURL(appUrl);
          return true;
        }
      } catch {
        // Fall through to generic
      }
    }
  }

  // Fallback: generic UPI scheme
  try {
    const canOpen = await Linking.canOpenURL(genericUrl);
    if (canOpen) {
      await Linking.openURL(genericUrl);
      return true;
    }
  } catch {
    // Could not open
  }

  return false;
}
