// Native W3C WebAuthn Biometric & Passkey Helper (Face ID, Touch ID, Android Fingerprint, Windows Hello)

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function isPasskeySupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
  );
}

// 1. Biometric Passkey Registration (Enroll Device Face ID / Fingerprint)
export async function registerDevicePasskey(username: string): Promise<{ credentialId: string; publicKey: string }> {
  if (!isPasskeySupported()) {
    throw new Error("Biometric Passkeys are not supported on this browser.");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const userId = new Uint8Array(16);
  window.crypto.getRandomValues(userId);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: "MarioTube",
      id: window.location.hostname,
    },
    user: {
      id: userId,
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" }, // ES256
      { alg: -257, type: "public-key" }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Face ID, Touch ID, Windows Hello
      userVerification: "preferred",
      residentKey: "preferred",
    },
    timeout: 60000,
    attestation: "none",
  };

  try {
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;

    if (!credential) throw new Error("Passkey creation was cancelled.");

    return {
      credentialId: credential.id,
      publicKey: bufferToBase64(credential.rawId),
    };
  } catch (error: any) {
    if (error.name === "NotAllowedError") {
      throw new Error("Biometric prompt was cancelled or timed out.");
    }
    throw error;
  }
}

// 2. Biometric Passkey Authentication (Instant Sign-in via Face ID / Fingerprint)
export async function authenticateDevicePasskey(): Promise<{ credentialId: string }> {
  if (!isPasskeySupported()) {
    throw new Error("Biometric Passkeys are not supported on this browser.");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    rpId: window.location.hostname,
    userVerification: "preferred",
    timeout: 60000,
  };

  try {
    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential;

    if (!assertion) throw new Error("Biometric verification was cancelled.");

    return {
      credentialId: assertion.id,
    };
  } catch (error: any) {
    if (error.name === "NotAllowedError") {
      throw new Error("Biometric scan was cancelled.");
    }
    throw error;
  }
}
