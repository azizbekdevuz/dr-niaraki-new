/**
 * Types for parser results and warnings
 */

export interface ParseWarning {
  readonly field: string;
  readonly index?: number;
  readonly message: string;
  readonly severity: 'info' | 'warning' | 'error';
  readonly raw?: string;
}

export interface ParseSection {
  readonly title: string;
  readonly content: string;
  readonly startLine: number;
  readonly endLine: number;
}

export interface ParseResult<T> {
  readonly data: T;
  readonly warnings: ParseWarning[];
  readonly raw?: string;
}

export interface DocxParseResult {
  readonly html: string;
  readonly text: string;
  readonly messages: DocxMessage[];
}

export interface DocxMessage {
  readonly type: 'warning' | 'error';
  readonly message: string;
}

export interface ParserContext {
  readonly warnings: ParseWarning[];
  readonly parserVersion: string;
  readonly sourceFileName: string;
}

// Section identifiers used by the parser
export type SectionType = 
  | 'profile'
  | 'summary'
  | 'education'
  | 'experience'
  | 'research'
  | 'publications'
  | 'patents'
  | 'awards'
  | 'skills'
  | 'contact'
  | 'students'
  | 'grants'
  | 'workshops'
  | 'services'
  | 'unknown';

export interface DetectedSection {
  readonly type: SectionType;
  readonly title: string;
  readonly content: string;
  readonly confidence: number;
}

