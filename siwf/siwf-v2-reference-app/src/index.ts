import { startSiwf } from "@projectlibertylabs/siwf-embedded-wallet-sdk";

async function main(): Promise<void> {
    // Goerli ETH account
  const accountId: string = "0x215baa37ceDFAeA4b6d6d1972DEFed495475814e";
  const signatureFn = async (): Promise<string> => {
    // TODO: Implement actual signature function
    return "mock-signature";
  };

  const gatewayFetchFn = async (method: string, path: string, body: any): Promise<any> => {
    const baseUrl = "http://localhost:3013";
    const url = new URL(baseUrl + path);
    const response = await fetch(url.toString(), {
      method,
      body,
    });
    const data = await response.json();
    return data;
  };
  const siwfSignedRequest: string = "eyJyZXF1ZXN0ZWRTaWduYXR1cmVzIjp7InB1YmxpY0tleSI6eyJlbmNvZGVkVmFsdWUiOiJmNmEySGY3V0JrdzU1VDh5WGd6N0pCSGYyaVpGbkdyY29aV3dGcWozTW5uaW9VTjRuIiwiZW5jb2RpbmciOiJiYXNlNTgiLCJmb3JtYXQiOiJzczU4IiwidHlwZSI6IlNyMjU1MTkifSwic2lnbmF0dXJlIjp7ImFsZ28iOiJTUjI1NTE5IiwiZW5jb2RpbmciOiJiYXNlMTYiLCJlbmNvZGVkVmFsdWUiOiIweGE2MDFhMDMzMTIwMWIxZjc1MjRmZGZlZWMzNTEwZTZmMDkxMjJjYzdjYWY2MTU0OTQxMzFhYjdmYTQ2NWZmNmFmZTU1YzZkMjVhOTJiOTcyMTVjZGZmOWMxYjI0ZWE1ZmEzNWZkZjRhOGJjYzE5YjI5OGU2NjMzZTM2YzU2NzgyIn0sInBheWxvYWQiOnsiY2FsbGJhY2siOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvbG9naW4vY2FsbGJhY2siLCJwZXJtaXNzaW9ucyI6WzYsNyw4LDksMTBdfX0sInJlcXVlc3RlZENyZWRlbnRpYWxzIjpbeyJhbnlPZiI6W3sidHlwZSI6IlZlcmlmaWVkRW1haWxBZGRyZXNzQ3JlZGVudGlhbCIsImhhc2giOlsiYmNpcWU0cW9jemhmdGljaTRkemZ2ZmJlbDdmbzRoNHNyNWdyY28zb292d3lrNnk0eW5mNDR0c2kiXX0seyJ0eXBlIjoiVmVyaWZpZWRQaG9uZU51bWJlckNyZWRlbnRpYWwiLCJoYXNoIjpbImJjaXFqc3BuYndwYzN3ang0ZmV3Y2VrNWRheXNkanBiZjV4amltejV3bnU1dWo3ZTN2dTJ1d25xIl19XX0seyJ0eXBlIjoiVmVyaWZpZWRHcmFwaEtleUNyZWRlbnRpYWwiLCJoYXNoIjpbImJjaXFtZHZteGQ1NHp2ZTVraWZ5Y2dzZHRvYWhzNWVjZjRoYWwydHMzZWV4a2dvY3ljNW9jYTJ5Il19XX0";
  const userHandle: string = "coolUserHandle";
  const email: string = "coolUser@test.com";
  const msaCreationCallback = (): void => {
    // TODO: Implement MSA creation callback
  };
  
  try {
    const startSiwfResponse = await startSiwf(
      accountId,
      signatureFn,
      gatewayFetchFn,
      siwfSignedRequest,
      userHandle,
      email,
      msaCreationCallback,
    );
    
    console.log("SIWF started successfully:", startSiwfResponse);
  } catch (error) {
    console.error("Error starting SIWF:", error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
}); 