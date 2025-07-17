import { startSiwf, getAccountForAccountId } from "@projectlibertylabs/siwf-embedded-wallet-sdk";
import type { 
  SiwfOptions,
  SiwfResult,
  WalletType,
  GatewayResponse,
  MsaResponse
} from '../types';

// Configuration constants - using Vite proxy to avoid CORS issues
const GATEWAY_BASE_URL = "/api"; // Proxied through Vite to localhost:3013
const SIWF_SIGNED_REQUEST = "eyJyZXF1ZXN0ZWRTaWduYXR1cmVzIjp7InB1YmxpY0tleSI6eyJlbmNvZGVkVmFsdWUiOiJmNmEySGY3V0JrdzU1VDh5WGd6N0pCSGYyaVpGbkdyY29aV3dGcWozTW5uaW9VTjRuIiwiZW5jb2RpbmciOiJiYXNlNTgiLCJmb3JtYXQiOiJzczU4IiwidHlwZSI6IlNyMjU1MTkifSwic2lnbmF0dXJlIjp7ImFsZ28iOiJTUjI1NTE5IiwiZW5jb2RpbmciOiJiYXNlMTYiLCJlbmNvZGVkVmFsdWUiOiIweDdhY2RjNjQyN2NiMmRlMWE4OGUyMzFhM2JlZDQyMzdlYjA5MjUxMzNlZWRmOGI1MDU4NTMzYzA5ZDIzZDgzNmFmZTlhNjk1MjM3YjdkNzgyNmVlMzc4OGEyZTQ4YzRmZTkzZWM3ZjM2Y2U1YjI3ODUwNjM3ZTJkMGQ3NTIyNjgyIn0sInBheWxvYWQiOnsiY2FsbGJhY2siOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvbG9naW4vY2FsbGJhY2siLCJwZXJtaXNzaW9ucyI6WzYsNyw4LDksMTBdfX0sInJlcXVlc3RlZENyZWRlbnRpYWxzIjpbeyJhbnlPZiI6W3sidHlwZSI6IlZlcmlmaWVkRW1haWxBZGRyZXNzQ3JlZGVudGlhbCIsImhhc2giOlsiYmNpcWU0cW9jemhmdGljaTRkemZ2ZmJlbDdmbzRoNHNyNWdyY28zb292d3lrNnk0eW5mNDR0c2kiXX0seyJ0eXBlIjoiVmVyaWZpZWRQaG9uZU51bWJlckNyZWRlbnRpYWwiLCJoYXNoIjpbImJjaXFqc3BuYndwYzN3ang0ZmV3Y2VrNWRheXNkanBiZjV4amltejV3bnU1dWo3ZTN2dTJ1d25xIl19XX0seyJ0eXBlIjoiVmVyaWZpZWRHcmFwaEtleUNyZWRlbnRpYWwiLCJoYXNoIjpbImJjaXFtZHZteGQ1NHp2ZTVraWZ5Y2dzZHRvYWhzNWVjZjRoYWwydHMzZWV4a2dvY3ljNW9jYTJ5Il19XX0";

// Wallet request interface
interface WalletRequest {
  method: string;
  params: any[];
}

/**
 * Validate account ID format based on wallet type
 */
export function validateAccountId(accountId: string, walletType: WalletType): boolean {
  if (walletType === 'metamask') {
    // Ethereum format: 0x followed by 40 hex characters
    return /^0x[a-fA-F0-9]{40}$/.test(accountId);
  } else if (walletType === 'polkadot') {
    // Substrate/SS58 format: 47-48 characters, starts with specific prefixes
    // For testing, we'll be more permissive and let SDK handle validation
    return accountId.length >= 40;
  }
  return false;
}

/**
 * Create signature function for different wallet types
 * SDK expects a function that takes (request, accountId) => Promise<string>
 */
export function createSignatureFn(
  signTypedData: (data: any) => Promise<string>,
  signMessage: (message: string) => Promise<string>,
  walletType: WalletType,
  account: string
) {
  return async (request: WalletRequest, accountId: string): Promise<string> => {
    console.log("📝 Signature request received:", { method: request.method, walletType, accountId });

    try {
      if (walletType === 'metamask') {
        // MetaMask-specific signing methods
        if (request.method === "eth_signTypedData_v4") {
          const [address, typedDataString] = request.params;
          const typedData = JSON.parse(typedDataString);
          return await signTypedData(typedData);
        }
        
        if (request.method === "personal_sign") {
          const [message, address] = request.params;
          return await signMessage(message);
        }
      } else if (walletType === 'polkadot') {
        // Polkadot.js signing - treat all as message signing
        // The SDK will handle the data format appropriately
        if (request.method === "eth_signTypedData_v4") {
          // For Polkadot, convert typed data to message format
          const [address, typedDataString] = request.params;
          return await signMessage(typedDataString);
        }
        
        if (request.method === "personal_sign") {
          const [message, address] = request.params;
          return await signMessage(message);
        }
      }

      throw new Error(`Unsupported signing method: ${request.method} for wallet type: ${walletType}`);
    } catch (error) {
      console.error("❌ Signature failed:", error);
      throw error;
    }
  };
}

/**
 * Enhanced Gateway fetch function for v2 API
 */
export async function gatewayFetchFn(
  method: "GET" | "POST",
  path: string,
  body?: any
): Promise<Response> {
  try {
    // Construct URL properly for both absolute and relative base URLs
    const url = GATEWAY_BASE_URL.startsWith('http') 
      ? new URL(path, GATEWAY_BASE_URL).toString()
      : `${GATEWAY_BASE_URL}${path}`;
    console.log(`🌐 Gateway ${method} request to:`, url);

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (body && method === "POST") {
      requestOptions.body = JSON.stringify(body);
      console.log("📤 Request body sent");
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      let errorDetails: any;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = {
          error: 'Unknown Error',
          message: await response.text(),
          statusCode: response.status
        };
      }

      console.error("❌ Gateway API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails.error,
        message: errorDetails.message
      });

      throw new Error(`Gateway error (${response.status}): ${errorDetails.message || response.statusText}`);
    }

    console.log("✅ Gateway response received:", response.status);
    return response;
  } catch (error) {
    console.error("❌ Gateway fetch failed:", error);
    throw error;
  }
}

/**
 * MSA Creation callback - called when MSA ID is allocated
 */
export function createMsaCallback(onMsaCreated: (account: any) => void) {
  return (account: any): void => {
    console.log("🎉 MSA Created/Retrieved:", {
      msaId: account.msaId,
      handle: account.handle || 'No handle'
    });

    onMsaCreated(account);
  };
}

/**
 * Main SIWF login function for frontend - supports both wallet types
 */
export async function siwfLogin(
  options: SiwfOptions,
  signatureFn: (...args: any[]) => Promise<string>,
  onMsaCreated: (account: any) => void,
  accountId: string,
  walletType: WalletType
): Promise<SiwfResult> {
  const { handle, email } = options;

  try {
    console.log("🚀 Starting SIWF login process", {
      accountId,
      walletType,
      handle,
      email: email ? "***@***.***" : "none"
    });

    // Validate account ID format
    if (!validateAccountId(accountId, walletType)) {
      throw new Error(`Invalid account ID format for ${walletType}: ${accountId}`);
    }

    console.log("🔗 Initiating SIWF with Gateway...");
    
    // Start the SIWF process
    const response = await startSiwf(
      accountId,
      signatureFn,
      gatewayFetchFn,
      SIWF_SIGNED_REQUEST,
      handle,  
      email,   
      createMsaCallback(onMsaCreated)
    );

    console.log("✅ SIWF completed successfully!");
    console.log("📋 Response summary:", {
      controlKey: response.controlKey,
      msaId: response.msaId,
      email: response.email,
      phoneNumber: response.phoneNumber,
      hasGraphKey: !!response.graphKey,
      credentialCount: response.rawCredentials?.length || 0,
      signUpStatus: response.signUpStatus
    });

    // Determine if this is a new user based on signUpStatus
    const isNewUser = !!response.signUpReferenceId;

    return {
      msaId: response.msaId,
      accountId,
      handle: handle,
      credentials: response.rawCredentials || [],
      isNewUser
    };

  } catch (error) {
    console.error("❌ SIWF login failed:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Invalid UTF-8 sequence")) {
        throw new Error("Invalid signed request format. Please check the SIWF configuration.");
      } else if (error.message.includes("accountId")) {
        throw new Error(`Account validation failed for ${walletType}. Please check your wallet address format.`);
      }
    }
    
    throw error;
  }
} 