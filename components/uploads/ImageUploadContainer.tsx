"use client";

import React, { useState } from "react";
import ImageKitUpload from "./ImageKitUpload";
import { UploadResponse } from "@/types/imagekit";
import { Settings, Folder, Tag, Database } from "lucide-react";

interface ImageUploadContainerProps {
  onUploadComplete?: (files: UploadResponse[]) => void;
}

const ImageUploadContainer: React.FC<ImageUploadContainerProps> = ({
  onUploadComplete,
}) => {
  const [folder, setFolder] = useState("/website-uploads");
  const [tags, setTags] = useState<string[]>(["nextjs", "upload"]);
  const [uploadHistory, setUploadHistory] = useState<UploadResponse[]>([]);

  const handleUploadSuccess = (response: UploadResponse) => {
    setUploadHistory((prev) => [response, ...prev.slice(0, 4)]);

    if (onUploadComplete) {
      onUploadComplete([...uploadHistory, response]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Image Upload to ImageKit</h1>
          <p className="text-blue-100">
            Upload images directly to ImageKit CDN with automatic optimization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Left Panel - Upload Component */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Upload Files
              </h2>
              <p className="text-gray-600">
                Drag & drop your images or click to browse. Files will be
                uploaded directly to ImageKit.
              </p>
            </div>

            <ImageKitUpload
              onUploadSuccess={handleUploadSuccess}
              folder={folder}
              tags={tags}
              multiple={true}
              showPreview={true}
              showProgress={true}
              buttonText="Upload Images"
              maxFileSize={5 * 1024 * 1024} // 5MB
              acceptedFileTypes={[
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif",
              ]}
              className="p-6 border border-gray-200 rounded-xl"
            />
          </div>

          {/* Right Panel - Settings and Info */}
          <div className="space-y-6">
            {/* Upload Settings */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center mb-4">
                <Settings className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Upload Settings
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Folder className="w-4 h-4 mr-2" />
                    Upload Folder
                  </label>
                  <input
                    type="text"
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/uploads"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 mr-2" />
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tags.join(", ")}
                    onChange={(e) =>
                      setTags(
                        e.target.value.split(",").map((tag) => tag.trim())
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="nextjs, upload, website"
                  />
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            {uploadHistory.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-4">
                  <Database className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Recent Uploads
                  </h3>
                </div>

                <div className="space-y-3">
                  {uploadHistory.slice(0, 5).map((file, index) => (
                    <div
                      key={file.fileId}
                      className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">
                          {file.fileType
                            .split("/")[1]
                            ?.slice(0, 3)
                            .toUpperCase() || "IMG"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Guidelines */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                📋 Upload Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Supported: JPG, PNG, WebP, GIF</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Max file size: 5MB per image</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Automatic image optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Secure CDN delivery worldwide</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Multiple uploads supported</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadContainer;
