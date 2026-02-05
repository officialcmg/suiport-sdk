/**
 * SuiPort SDK Configuration
 */

import { OpenAPI } from '@defuse-protocol/one-click-sdk-typescript';

export interface SuiportConfig {
    /** NEAR API key for 1Click service */
    apiKey: string;
    /** API base URL (default: production) */
    baseUrl?: string;
    /** Default referral ID */
    referral?: string;
}

let _config: SuiportConfig | null = null;

/**
 * Initialize the SuiPort SDK
 *
 * @example
 * ```ts
 * import { initSuiport } from '@suiport/sdk'
 *
 * initSuiport({
 *   apiKey: 'your-near-api-key',
 * })
 * ```
 */
export function initSuiport(config: SuiportConfig): void {
    _config = config;

    if (!config.apiKey) {
        throw new Error("Suiport SDK Error: apiKey is required. Pass your NEAR API key to initSuiport().");
    }

    // Configure the underlying 1Click SDK
    OpenAPI.BASE = config.baseUrl || 'https://1click.chaindefuser.com';
    OpenAPI.TOKEN = config.apiKey;
}

/**
 * Get the current SDK configuration
 */
export function getConfig(): SuiportConfig {
    if (!_config) {
        throw new Error(
            'SuiPort SDK not initialized. Call initSuiport() first.'
        );
    }
    return _config;
}

/**
 * Check if SDK is initialized
 */
export function isInitialized(): boolean {
    return _config !== null;
}
