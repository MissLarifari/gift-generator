// Byte/char counting — must match 3dxchat's profile editor, where each
// newline counts as 2 (CRLF). Ported 1:1 from the original tool.
const encoder = new TextEncoder();

export const byteLen = (s: string): number => encoder.encode(s || '').length;
export const giftCount = (s: string): string => (s || '').replace(/\n/g, '\r\n');
export const giftChars = (s: string): number => giftCount(s).length;
export const giftBytes = (s: string): number => byteLen(giftCount(s));
