# Sign In With Frequency (SIWF) Package Documentation

## Description

The **@projectlibertylabs/siwf** package is a JavaScript library that enables decentralized authentication using the Frequency blockchain. It provides utilities for generating signed authentication requests, validating responses, and managing digital credentials. The companion **@projectlibertylabs/siwf-embedded-wallet-sdk** package offers higher-level functions specifically designed for embedded wallet experiences, allowing programmatic control over wallet operations including MSA (Message Source Account) creation, login flows, and credential management on the Frequency network.

## Prerequisites

### System Requirements
- **Node.js**: v22+ (recommended)
- **TypeScript**: Optional but recommended for type safety
- **Package Manager**: npm or yarn

### Required Setup
1. **Frequency Gateway Account Service**: You must have access to a Frequency Gateway Account Service instance to proxy API calls
2. **Wallet Integration**: An embedded wallet that can sign EIP-712 and CAIP-122 messages
3. **SIWF Signed Request**: A properly encoded base64url signed request string
4. **Callback URI**: A valid callback URL for authentication flow completion

### Network Configuration
- The library supports both **production** and **staging** Frequency network environments
- Proper chain type configuration is required for signature validation

## API

### Core SIWF Package (@projectlibertylabs/siwf)

#### Authentication Flow Functions

**`generateAuthenticationUrl(signedRequest, additionalCallbackUrlParams, options?)`**
- **Description**: Generates an Authentication URL for SIWF to start the user's login path
- **Parameters**:
  - `signedRequest: SiwfSignedRequest | string` - The signed request object or string
  - `additionalCallbackUrlParams: URLSearchParams | string` - URL parameters for the callback
  - `options?: SiwfOptions` - Endpoint selection options
- **Returns**: `string` - The generated Authentication URL

**`getLoginResult(authorizationCode, options)`**
- **Description**: Fetch and extract the result of the login from Frequency Access
- **Parameters**:
  - `authorizationCode: string` - The code from callback URI parameters
  - `options: SiwfOptions` - Options for endpoint selection and domain checks
- **Returns**: `Promise<SiwfResponse>` - The parsed and validated response

**`validateSiwfResponse(response, options)`**
- **Description**: Validates a possible SIWF Response
- **Parameters**:
  - `response: unknown` - A possible SIWF Response
  - `options: SiwfOptions` - Options including loginMsgUri for domain validation
- **Returns**: `Promise<SiwfResponse>` - The validated response

**`hasChainSubmissions(result)`**
- **Description**: Checks if there are any chain submissions in the given result
- **Parameters**:
  - `result: SiwfResponse` - The result from the login
- **Returns**: `boolean`

#### Request Generation Functions

**`generateSignedRequest(encodingType, formatType, keyType, chainType, providerKeyUriOrPrivateKey, callbackUri, permissions, credentials?, applicationContext?)`**
- **Description**: Generates the signed payload for authentication flow using a keypair
- **Parameters**:
  - `encodingType: EncodingType` - The encoding type
  - `formatType: FormatType` - The format type  
  - `keyType: CurveType` - The key type
  - `chainType: ChainType` - Chain type for signature validation
  - `providerKeyUriOrPrivateKey: string` - Key URI or private key
  - `callbackUri: string` - Return URI after authentication
  - `permissions: number[]` - Frequency Schema IDs for delegation
  - `credentials?: SiwfCredentialRequest[]` - Optional credential requests
  - `applicationContext?: {url: string}` - Optional application context
- **Returns**: `Promise<SiwfSignedRequest>`

**`buildSignedRequest(encodingType, formatType, keyType, signature, signerPublicKey, callbackUri, permissions, credentials?, applicationContext?)`**
- **Description**: Builds the signed request using signature and public key
- **Parameters**: Similar to `generateSignedRequest` but with separate `signature` and `signerPublicKey` parameters
- **Returns**: `SiwfSignedRequest`

**`generateEncodedSignedRequest(...)`**
- **Description**: Generates the encoded signed payload as base64url string
- **Parameters**: Same as `generateSignedRequest`
- **Returns**: `Promise<string>` - Base64url encoded signed payload

**`encodeSignedRequest(signedRequest)`**
- **Description**: Encodes a signed request as base64url string
- **Parameters**:
  - `signedRequest: SiwfSignedRequest` - A signed request
- **Returns**: `string` - Base64url encoded payload

**`decodeSignedRequest(encodedSignedRequest)`**
- **Description**: Decodes a base64url encoded signed request
- **Parameters**:
  - `encodedSignedRequest: string` - Encoded signed request
- **Returns**: `SiwfSignedRequest`

**`generateRequestSigningData(callbackUri, permissions, isBytesWrapped?)`**
- **Description**: Generates hex payload for signing (Sr25519 only)
- **Parameters**:
  - `callbackUri: string` - Return URI after authentication
  - `permissions: number[]` - Frequency Schema IDs
  - `isBytesWrapped?: boolean` - Generate with/without `<Bytes>` wrapping (default: true)
- **Returns**: `string` - Hex string for signing

#### Constants

**Credential Request Constants**:
- `VerifiedEmailAddressCredential` - Request for verified email address
- `VerifiedPhoneNumberCredential` - Request for verified SMS/Phone Number  
- `VerifiedGraphKeyCredential` - Request for private graph encryption key
- `VerifiedRecoverySecretCredential` - Request for account recovery secret

### Embedded Wallet SDK (@projectlibertylabs/siwf-embedded-wallet-sdk)

#### Main Functions

**`startSiwf(accountId, signatureFn, gatewayFetchFn, encodedSiwfSignedRequest, signUpHandle?, signUpEmail?, msaCreationCallbackFn?)`**
- **Description**: Executes login or signUp on Frequency Gateway based on whether accountId has existing account
- **Parameters**:
  - `accountId: Address | string` ✅ **Required** - User's wallet address (0x prefixed)
  - `signatureFn: SignatureFn` ✅ **Required** - Callback connecting embedded wallet to SDK
  - `gatewayFetchFn: GatewayFetchFn` ✅ **Required** - Callback connecting SDK to Gateway Account Service
  - `encodedSiwfSignedRequest: string` ✅ **Required** - Encoded SIWF signed request string
  - `signUpHandle?: string` ❄️ **New Users Only** - Handle to register
  - `signUpEmail?: string` ❄️ **New Users Only** - User's email for recovery setup
  - `msaCreationCallbackFn?: MsaCreationCallbackFn` ❄️ **Optional** - Callback when MSA ID is claimed
- **Returns**: `Promise<GatewaySiwfResponse>`
- **Throws**: `GatewayFetchError` or `Error` when request fails

**`getAccountForAccountId(gatewayFetchFn, accountId)`**
- **Description**: Fetches user's account information from Gateway Services
- **Parameters**:
  - `gatewayFetchFn: GatewayFetchFn` ✅ **Required** - Gateway service callback
  - `accountId: Address | string` ✅ **Required** - User's wallet address
- **Returns**: `Promise<AccountResponse | null>`
- **Throws**: `GatewayFetchError` when request fails

#### Type Definitions

**`SignatureFn`**: `(request: CAIP122 | EIP712) => Promise<string>`
- Connects embedded wallet to SIWF interface
- Handles `eth_signTypedData_v4` (EIP-712) and `personal_sign` (CAIP-122) requests

**`GatewayFetchFn`**: `(method: "GET" | "POST", path: string, body?: GatewayFetchBody) => Promise<Response>`
- Connects SDK to Frequency Gateway Account Service
- **Supported paths**:
  - `/v1/accounts/account/${Address}` - Fetch account details
  - `/v2/accounts/siwf` - SIWF authentication endpoint  
  - `/v1/frequency/blockinfo` - Current block information

**`MsaCreationCallbackFn`**: `(account: AccountResponse) => void`
- Called when MSA ID allocation completes (for new users) or immediately (existing users)

**Response Types**:

```typescript
interface GatewaySiwfResponse {
  controlKey: string;
  signUpReferenceId?: string;
  signUpStatus?: string;
  msaId?: string;
  email?: string;
  phoneNumber?: string;
  graphKey?: SiwfResponseCredentialGraph["credentialSubject"];
  recoverySecret?: SiwfResponseCredentialRecoverySecret["credentialSubject"]["recoverySecret"];
  rawCredentials?: object[];
}

interface AccountResponse {
  msaId: string;
  handle?: HandleResponse;
}

interface HandleResponse {
  base_handle: string;
  canonical_base: string;
  suffix: number;
}
```

## ENV_VARS

The SIWF packages **do not require any environment variables** for core functionality. However, your implementation will likely need:

### Application-Level Environment Variables

**Required for Gateway Integration**:
- `GATEWAY_BASE_URL` - Your Frequency Gateway Account Service base URL
- `GATEWAY_API_KEY` or similar authentication mechanism for your gateway proxy

**Required for SIWF Configuration**:
- `SIWF_ENDPOINT` - Either `'production'` or `'staging'` for the SIWF service
- `CALLBACK_URI` - The URI users return to after authentication
- `LOGIN_MSG_URI` - Domain(s) for CAIP-122 login message validation

**Optional Configuration**:
- `CHAIN_TYPE` - Frequency chain type for signature validation (usually handled automatically)
- `PERMISSIONS` - Default permission schema IDs (can be set in code)

### Example Environment Setup

```bash
# Gateway Configuration
GATEWAY_BASE_URL=https://your-gateway-proxy.com
GATEWAY_API_TOKEN=your-secure-token

# SIWF Configuration  
SIWF_ENDPOINT=production
CALLBACK_URI=https://your-app.com/login/callback
LOGIN_MSG_URI=your-app.com

# Optional
DEFAULT_PERMISSIONS=6,7,8,9,10
```

**Note**: Since the Gateway Account Service is not public-facing, you must implement a secure proxy in your backend that forwards requests to the actual Gateway service while handling authentication and authorization.