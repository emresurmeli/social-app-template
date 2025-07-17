# siwf-reference-app

This SIWF reference app uses v2 endpoints to authenticate users on the Frequency blockchain. The user can Sign Up and Login, and they can do this via Ethereum or Polkadot addresses. 

Flow:
Step 0: Compile credentials, permissions and a callback url. (Currently there is minimal documentation about this and we use our online generator to do it. We should make this a part of the app)
Step 1: GET /v2/accounts/siwf
    - This endpoint requires you to provide query params for credentials, permissions, and a callback url
    - It returns a Frequency Access url, as well as a signed request providing wallet address, and credentials, permissions, and a callback url
    - FA uses this to make a request??
Step 2: POST /v2/accounts/siwf
    - This endpoint takes an authorizationCode and authorizationPayload
    - Currently FA does this, and we don't have another way to do it unless someone uses siwf v1.

Issues to simplify:
SIWF is overtly complex, and you need to know a lot about the stack in order to make a auth request.

Issues:
1. Initial GET /v2/accounts/siwf request query parameters are confusing
    - credentials, permissions, and a callback url
    - In order to provide these query params, we need to understand what credentials, permissions and a callback url is.
    - Currently we have a url builder to help with this: https://projectlibertylabs.github.io/siwf/v2/docs/Generate.html#signed-request-generator
        - It's a UI to build the GET request, which gives you a signedRequest payload, FA link and a mainnet RPC URL
    - We also call this a signed request.
    - Like what is an application context url??
    - TO DO: Create simplified documentation in an ELI5 way
2. Now you have to make another request, a POST /v2/accounts/siwf
    - This obfuscates the creation of authorizationCode and authorizationPayload
    - Is it worth rolling out an alternative to this?
    - Should gateway account-api have an endpoint to generate auth code and payload?


There are 3 ways to signin
1. No wallet with FA (v2)
    FA provides authorization code and payload
    We need to create a FA alternetive in Gateway maybe
        Problem: A single wallet to rule this functionality which FA does
2. X With a Polkadot wallet (v1)
    We will need to create a siwf support for auth code and payload (Gateway?)
3. X With a Ethereum wallet (v1)
    We will need to create a siwf support for auth code and payload (Gateway?)

