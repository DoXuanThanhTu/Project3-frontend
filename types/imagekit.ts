/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UploadOptions {
  file: File;
  fileName?: string;
  useUniqueFileName?: boolean;
  folder?: string;
  isPrivateFile?: boolean;
  tags?: string[];
  customCoordinates?: string;
  responseFields?: string[];
  extensions?: Array<{
    name: string;
    [key: string]: any;
  }>;
  webhookUrl?: string;
  overwriteFile?: boolean;
  overwriteAITags?: boolean;
  overwriteTags?: boolean;
  overwriteCustomMetadata?: boolean;
  customMetadata?: Record<string, any>;
  transformation?: {
    pre?: string;
    post?: string[];
  };
  checks?: string;
}

export interface AuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
}

export interface UploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  filePath: string;
  fileType: string;
  tags?: string[];
  customMetadata?: Record<string, any>;
  extensionStatus?: Record<string, any>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
