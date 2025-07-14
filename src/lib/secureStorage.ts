// Secure storage with encryption for sensitive data
import { cryptoManager } from './crypto';

interface SecureStorageItem {
  data: string;
  timestamp: number;
  expiresAt?: number;
}

class SecureStorage {
  private encryptionKey: CryptoKey | null = null;
  private keyRotationInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    await this.getOrCreateEncryptionKey();
    this.startKeyRotation();
  }

  private async getOrCreateEncryptionKey(): Promise<CryptoKey> {
    if (this.encryptionKey) return this.encryptionKey;

    // Try to load existing key
    const storedKeyData = localStorage.getItem('kraken_storage_key');
    if (storedKeyData) {
      try {
        const keyData = JSON.parse(storedKeyData);
        const keyBytes = new Uint8Array(atob(keyData.key).split('').map(c => c.charCodeAt(0)));
        
        this.encryptionKey = await window.crypto.subtle.importKey(
          'raw',
          keyBytes,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
        
        console.log('Loaded existing storage encryption key');
        return this.encryptionKey;
      } catch (error) {
        console.warn('Failed to load existing key, generating new one');
      }
    }

    // Generate new key
    this.encryptionKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Store key (in production, this should be more secure)
    const exportedKey = await window.crypto.subtle.exportKey('raw', this.encryptionKey);
    const keyData = {
      key: btoa(String.fromCharCode(...new Uint8Array(exportedKey))),
      created: Date.now()
    };
    localStorage.setItem('kraken_storage_key', JSON.stringify(keyData));
    
    console.log('Generated new storage encryption key');
    return this.encryptionKey;
  }

  private startKeyRotation(): void {
    // Rotate encryption key every 24 hours
    this.keyRotationInterval = setInterval(async () => {
      console.log('Rotating storage encryption key...');
      await this.rotateKey();
    }, 24 * 60 * 60 * 1000);
  }

  private async rotateKey(): Promise<void> {
    try {
      // Get all encrypted data
      const allData = this.getAllEncryptedData();
      
      // Generate new key
      const oldKey = this.encryptionKey;
      this.encryptionKey = null;
      await this.getOrCreateEncryptionKey();
      
      // Re-encrypt all data with new key
      for (const [key, encryptedData] of allData) {
        if (oldKey) {
          try {
            const decrypted = await this.decryptData(encryptedData, oldKey);
            await this.setItem(key, decrypted.data, decrypted.expiresAt);
          } catch (error) {
            console.error('Failed to re-encrypt data for key:', key);
          }
        }
      }
      
      console.log('Key rotation completed successfully');
    } catch (error) {
      console.error('Key rotation failed:', error);
    }
  }

  private getAllEncryptedData(): Map<string, string> {
    const data = new Map<string, string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kraken_secure_')) {
        const value = localStorage.getItem(key);
        if (value) {
          data.set(key.replace('kraken_secure_', ''), value);
        }
      }
    }
    return data;
  }

  private async encryptData(data: any, expiresAt?: number): Promise<string> {
    const key = await this.getOrCreateEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const item: SecureStorageItem = {
      data: JSON.stringify(data),
      timestamp: Date.now(),
      expiresAt
    };

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(JSON.stringify(item))
    );

    return btoa(String.fromCharCode(...new Uint8Array(iv))) + '.' + 
           btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  private async decryptData(encryptedData: string, key?: CryptoKey): Promise<SecureStorageItem> {
    const decryptionKey = key || await this.getOrCreateEncryptionKey();
    const [ivB64, dataB64] = encryptedData.split('.');
    
    const iv = new Uint8Array(atob(ivB64).split('').map(c => c.charCodeAt(0)));
    const data = new Uint8Array(atob(dataB64).split('').map(c => c.charCodeAt(0)));

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      decryptionKey,
      data
    );

    const item: SecureStorageItem = JSON.parse(new TextDecoder().decode(decrypted));
    
    // Check expiration
    if (item.expiresAt && Date.now() > item.expiresAt) {
      throw new Error('Data has expired');
    }

    return item;
  }

  async setItem(key: string, value: any, expiresInMs?: number): Promise<void> {
    const expiresAt = expiresInMs ? Date.now() + expiresInMs : undefined;
    const encrypted = await this.encryptData(value, expiresAt);
    localStorage.setItem(`kraken_secure_${key}`, encrypted);
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const encrypted = localStorage.getItem(`kraken_secure_${key}`);
      if (!encrypted) return null;

      const item = await this.decryptData(encrypted);
      return JSON.parse(item.data) as T;
    } catch (error) {
      console.warn('Failed to decrypt stored data for key:', key);
      // Clean up corrupted data
      localStorage.removeItem(`kraken_secure_${key}`);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(`kraken_secure_${key}`);
  }

  async clear(): Promise<void> {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kraken_secure_')) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Self-destruct messages
  async setExpiringMessage(messageId: string, message: any, expiresInMs: number): Promise<void> {
    await this.setItem(`message_${messageId}`, message, expiresInMs);
    
    // Set up automatic cleanup
    setTimeout(() => {
      this.removeItem(`message_${messageId}`);
    }, expiresInMs);
  }

  destroy(): void {
    if (this.keyRotationInterval) {
      clearInterval(this.keyRotationInterval);
    }
  }
}

export const secureStorage = new SecureStorage();