/**
 * Base URL for the backend API.
 * Pulls from process.env.EXPO_PUBLIC_API_URL (defined in .env) in production/expo bundles,
 * and falls back to localhost for local development.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
