/**
 * Email Helper Utilities
 * 
 * Type-safe utilities for handling email address conversions and extractions
 * between string and EmailAddress union types.
 */

import { EmailAddress } from '../types';

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if value is a string email address
 */
export function isStringEmail(from: string | EmailAddress): from is string {
  return typeof from === 'string';
}

/**
 * Check if value is an EmailAddress object
 */
export function isEmailAddressObject(from: string | EmailAddress): from is EmailAddress {
  return typeof from === 'object' && from !== null && 'email' in from;
}

// ============================================================================
// Email Extraction Functions
// ============================================================================

/**
 * Extract email string from string | EmailAddress union type
 */
export function getEmailString(from: string | EmailAddress): string {
  if (isStringEmail(from)) {
    return from;
  }
  return from.email;
}

/**
 * Extract display name from string | EmailAddress union type
 */
export function getEmailName(from: string | EmailAddress): string {
  if (isStringEmail(from)) {
    // Try to extract name from "Name <email@domain.com>" format
    const match = from.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return match[1].trim().replace(/^"|"$/g, ''); // Remove quotes if present
    }
    // If no name found, return the email part
    return from;
  }
  return from.name || from.email;
}

/**
 * Parse email string into EmailAddress object
 */
export function parseEmailString(emailString: string): EmailAddress {
  const match = emailString.match(/^(.+?)\s*<(.+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, ''), // Remove quotes if present
      email: match[2].trim()
    };
  }
  
  // If no name is found, just return the email
  return {
    email: emailString.trim()
  };
}

/**
 * Convert EmailAddress object to formatted string
 */
export function formatEmailAddress(emailAddress: EmailAddress): string {
  if (emailAddress.name) {
    return `"${emailAddress.name}" <${emailAddress.email}>`;
  }
  return emailAddress.email;
}

/**
 * Normalize email address to consistent format
 */
export function normalizeEmailAddress(from: string | EmailAddress): EmailAddress {
  if (isStringEmail(from)) {
    return parseEmailString(from);
  }
  return from;
}

/**
 * Extract domain from email address
 */
export function getEmailDomain(from: string | EmailAddress): string {
  const email = getEmailString(from);
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) {
    return '';
  }
  return email.substring(atIndex + 1).toLowerCase();
}

/**
 * Extract username from email address
 */
export function getEmailUsername(from: string | EmailAddress): string {
  const email = getEmailString(from);
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) {
    return email;
  }
  return email.substring(0, atIndex);
}

/**
 * Check if email is from a business domain
 */
export function isBusinessEmail(from: string | EmailAddress): boolean {
  const domain = getEmailDomain(from);
  
  // Common personal email domains
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'aol.com', 'yahoo.co.jp', 'docomo.ne.jp', 'softbank.ne.jp', 'au.com'
  ];
  
  return !personalDomains.includes(domain);
}

/**
 * Sanitize email for logging (remove sensitive info)
 */
export function sanitizeEmailForLogging(from: string | EmailAddress): string {
  const email = getEmailString(from);
  const domain = getEmailDomain(from);
  const username = getEmailUsername(from);
  
  if (username.length <= 2) {
    return `${username}@${domain}`;
  }
  
  // Mask username but keep first 2 and last 1 characters
  const maskedUsername = username.substring(0, 2) + 
    '*'.repeat(Math.max(0, username.length - 3)) + 
    username.substring(username.length - 1);
  
  return `${maskedUsername}@${domain}`;
}