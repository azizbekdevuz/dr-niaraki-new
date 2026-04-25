/**
 * Volume, issue, pages, impact factor, quartile extraction for a publication citation block.
 */

import type { MutablePublication } from '@/types/details';

export function applyPublicationVolumeIssuePages(trimmed: string, pub: MutablePublication): void {
  const volMatch = trimmed.match(/Vol\.?\s*(\d+)/i);
  if (volMatch) {
    pub.volume = volMatch[1];
  }

  const issueMatch = trimmed.match(/(?:No\.?|Issue)\s*(\d+)/i);
  if (issueMatch) {
    pub.issue = issueMatch[1];
  }

  const pagesMatch = trimmed.match(/pp?\.?\s*(\d+[-–]\d+)/);
  if (pagesMatch) {
    pub.pages = pagesMatch[1];
  }

  const ifMatch = trimmed.match(/IF[:\s]*(\d+\.?\d*)/i);
  if (ifMatch) {
    pub.impactFactor = ifMatch[1];
  }

  const qMatch = trimmed.match(/Q([1-4])/i) || trimmed.match(/(?:SCIE|SCI|SSCI)[^\)]*Q([1-4])/i);
  if (qMatch) {
    pub.quartile = `Q${qMatch[1]}`;
  }
}
