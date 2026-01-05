"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from "react";
import { useImageKitUpload } from "@/hooks/useImageKitUpload";
import { UploadResponse } from "@/types/imagekit";
import {
  Upload,
  X,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ImageKitUploadProps {
  onUploadSuccess?: (response: UploadResponse) => void;
  onUploadError?: (error: Error) => void;
  folder?: string;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  multiple?: boolean;
  className?: string;
  buttonText?: string;
  showPreview?: boolean;
  showProgress?: boolean;
  useUniqueFileName?: boolean;
  tags?: string[];
  customMetadata?: Record<string, any>;
}

const ImageKitUpload: React.FC<ImageKitUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  folder = "/uploads",
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ["image/*"],
  multiple = false,
  className = "",
  buttonText = "Upload Image",
  showPreview = true,
  showProgress = true,
  useUniqueFileName = true,
  tags,
  customMetadata,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Sử dụng hook upload
  const {
    uploadFile,
    isUploading,
    progress,
    error: uploadError,
    abortUpload,
    reset: resetUpload,
  } = useImageKitUpload({
    onSuccess: (response) => {
      setUploadedFiles((prev) => [...prev, response]);
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    },
    onError: (error) => {
      if (onUploadError) {
        onUploadError(error);
      }
    },
    folder,
    useUniqueFileName,
  });

  // Validate file
  const validateFile = (file: File): string | null => {
    // Kiểm tra file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${maxFileSize / (1024 * 1024)}MB`;
    }

    // Kiểm tra file type
    const acceptedTypes = acceptedFileTypes.map((type) => type.toLowerCase());
    const fileType = file.type.toLowerCase();
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    const isTypeValid = acceptedTypes.some((type) => {
      if (type.endsWith("/*")) {
        const category = type.split("/")[0];
        return fileType.startsWith(category + "/");
      }
      return fileType === type;
    });

    if (!isTypeValid) {
      return `File type not allowed. Allowed types: ${acceptedFileTypes.join(
        ", "
      )}`;
    }

    return null;
  };

  // Xử lý khi chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  // Xử lý files
  const handleFiles = (selectedFiles: File[]) => {
    setValidationError(null);

    const validFiles: File[] = [];
    const errors: string[] = [];

    selectedFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setValidationError(errors.join("\n"));
    }

    if (validFiles.length > 0) {
      if (multiple) {
        setFiles((prev) => [...prev, ...validFiles]);
      } else {
        setFiles(validFiles);
      }
    }
  };

  // Xử lý drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  // Upload tất cả files
  const handleUpload = async () => {
    for (const file of files) {
      await uploadFile(file, {
        folder,
        useUniqueFileName,
        tags,
        customMetadata,
      });
    }

    // Clear selected files after upload
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload single file
  const handleUploadSingle = async (file: File) => {
    await uploadFile(file, {
      folder,
      useUniqueFileName,
      tags,
      customMetadata,
    });

    // Remove file from selection
    setFiles((prev) => prev.filter((f) => f !== file));
  };

  // Xóa file đã chọn
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Xóa file đã upload
  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Copy URL to clipboard
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // Reset component
  const handleReset = () => {
    setFiles([]);
    setUploadedFiles([]);
    setValidationError(null);
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          borderColor: dragActive ? "#3b82f6" : "#e5e7eb",
          backgroundColor: dragActive ? "#f0f9ff" : "transparent",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={acceptedFileTypes.join(",")}
          multiple={multiple}
          className="hidden"
          id="file-upload"
        />

        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive
                  ? "Drop files here"
                  : "Drag & drop files or click to browse"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports: {acceptedFileTypes.join(", ")}
                <br />
                Max size: {formatFileSize(maxFileSize)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Select Files
            </button>
          </div>
        </label>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700 whitespace-pre-line">
              {validationError}
            </p>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Selected Files ({files.length})
          </h3>

          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded">
                    <span className="text-sm font-medium text-gray-700">
                      {file.name.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!multiple && (
                    <button
                      onClick={() => handleUploadSingle(file)}
                      disabled={isUploading}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Upload
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Controls */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {isUploading && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isUploading
                  ? "Uploading..."
                  : `Upload ${files.length} File${files.length > 1 ? "s" : ""}`}
              </button>

              {isUploading && (
                <button
                  onClick={abortUpload}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Cancel Upload
                </button>
              )}
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {showProgress && isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Uploading...</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Uploaded Files ({uploadedFiles.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={file.fileId}
                className="border rounded-lg overflow-hidden bg-white shadow-sm"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {file.fileType.startsWith("image") ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-sm text-gray-600">{file.fileType}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* File Details */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-gray-700">{file.fileType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dimensions:</span>
                      <span className="text-gray-700">
                        {file.width && file.height
                          ? `${file.width}×${file.height}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <button
                      onClick={() => copyUrl(file.url)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {copiedUrl === file.url ? "Copied!" : "Copy URL"}
                    </button>

                    <div className="flex items-center space-x-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        View
                      </a>
                      <button
                        onClick={() => removeUploadedFile(index)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700">
                Successfully uploaded {uploadedFiles.length} file
                {uploadedFiles.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageKitUpload;
