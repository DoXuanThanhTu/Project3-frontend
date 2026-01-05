"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { useState, useCallback, useRef } from "react";
import type {
  AuthParams,
  UploadOptions,
  UploadResponse,
  UploadProgress,
} from "@/types/imagekit";

interface UseImageKitUploadProps {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: UploadProgress) => void;
  folder?: string;
  useUniqueFileName?: boolean;
}

interface UseImageKitUploadReturn {
  uploadFile: (
    file: File,
    options?: Partial<UploadOptions>
  ) => Promise<UploadResponse | null>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  abortUpload: () => void;
  reset: () => void;
}

export const useImageKitUpload = ({
  onSuccess,
  onError,
  onProgress,
  folder = "/uploads",
  useUniqueFileName = true,
}: UseImageKitUploadProps = {}): UseImageKitUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function để lấy authentication parameters từ server
  const getAuthParams = useCallback(async (): Promise<AuthParams> => {
    try {
      const response = await fetch("/api/upload-auth");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Authentication failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return {
        token: data.token,
        expire: data.expire,
        signature: data.signature,
        publicKey: data.publicKey,
      };
    } catch (error) {
      console.error("Error getting auth params:", error);
      throw new Error("Failed to get upload authentication parameters");
    }
  }, []);

  // Function để upload file
  const uploadFile = useCallback(
    async (
      file: File,
      options?: Partial<UploadOptions>
    ): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      // Tạo AbortController cho upload hiện tại
      abortControllerRef.current = new AbortController();

      try {
        // Lấy authentication parameters
        const authParams = await getAuthParams();

        // Tạo file name nếu không được cung cấp
        const fileName = options?.fileName || file.name;

        // Upload file
        const uploadResponse = await upload({
          // Authentication parameters
          token: authParams.token,
          expire: authParams.expire,
          signature: authParams.signature,
          publicKey: authParams.publicKey,

          // File và tên file
          file,
          fileName,

          // Upload options
          useUniqueFileName: options?.useUniqueFileName ?? useUniqueFileName,
          folder: options?.folder ?? folder,
          isPrivateFile: options?.isPrivateFile ?? false,
          tags: options?.tags,
          customCoordinates: options?.customCoordinates,
          responseFields: options?.responseFields,
          extensions: options?.extensions,
          webhookUrl: options?.webhookUrl,
          overwriteFile: options?.overwriteFile,
          overwriteAITags: options?.overwriteAITags,
          overwriteTags: options?.overwriteTags,
          overwriteCustomMetadata: options?.overwriteCustomMetadata,
          customMetadata: options?.customMetadata,
          // transformation: options?.transformation,
          checks: options?.checks,

          // Progress callback
          onProgress: (event) => {
            const percentage = (event.loaded / event.total) * 100;
            setProgress(percentage);

            if (onProgress) {
              onProgress({
                loaded: event.loaded,
                total: event.total,
                percentage,
              });
            }
          },

          // Abort signal
          abortSignal: abortControllerRef.current.signal,
        });

        // Gọi callback thành công
        if (onSuccess) {
          onSuccess(uploadResponse as UploadResponse);
        }

        return uploadResponse as UploadResponse;
      } catch (error) {
        // Xử lý các loại error khác nhau
        let errorMessage = "Upload failed";

        if (error instanceof ImageKitAbortError) {
          errorMessage = "Upload was aborted";
          console.log("Upload aborted:", error.reason);
        } else if (error instanceof ImageKitInvalidRequestError) {
          errorMessage = `Invalid request: ${error.message}`;
          console.error("Invalid request error:", error);
        } else if (error instanceof ImageKitUploadNetworkError) {
          errorMessage = `Network error: ${error.message}`;
          console.error("Network error:", error);
        } else if (error instanceof ImageKitServerError) {
          errorMessage = `Server error: ${error.message}`;
          console.error("Server error:", error);
        } else if (error instanceof Error) {
          errorMessage = error.message;
          console.error("Upload error:", error);
        }

        setError(errorMessage);

        // Gọi error callback
        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMessage));
        }

        return null;
      } finally {
        setIsUploading(false);
        abortControllerRef.current = null;
      }
    },
    [getAuthParams, folder, useUniqueFileName, onSuccess, onError, onProgress]
  );

  // Function để abort upload
  const abortUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    abortControllerRef.current = null;
  }, []);

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    abortUpload,
    reset,
  };
};
