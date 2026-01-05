"use client";
import ImageUploadContainer from "@/components/uploads/ImageUploadContainer";
import ImageUploadPopup from "@/components/uploads/ImageUploadPopup";

import { UploadResponse } from "@/types/imagekit";
import { useState } from "react";

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);

  const handleUploadComplete = (files: UploadResponse[]) => {
    console.log("Upload complete:", files);
    setUploadedFiles((prev) => [...prev, ...files]);

    // Có thể gọi API để lưu URLs vào database
    files.forEach((file) => {
      // Gọi API backend của bạn
      fetch("/api/save-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.fileId,
          url: file.url,
          name: file.name,
          size: file.size,
        }),
      });
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Next.js ImageKit Uploader
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload images directly to ImageKit CDN with the latest Next.js SDK.
            Features include drag & drop, progress tracking, and automatic
            optimization.
          </p>
        </div>

        {/* <ImageUploadContainer onUploadComplete={handleUploadComplete} /> */}
        {/* <ImageUploadPopup
          onUploadComplete={handleUploadComplete}
          isOpen={true}
        /> */}
        {/* Display uploaded files count */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium">
              Total uploaded: {uploadedFiles.length} file
              {uploadedFiles.length > 1 ? "s" : ""}
            </p>
          </div>
        )}

        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl mb-4">1️⃣</div>
              <h3 className="font-semibold text-gray-700 mb-2">Select Files</h3>
              <p className="text-gray-600">
                Choose images from your device or drag & drop them into the
                upload area.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-4">2️⃣</div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Upload to ImageKit
              </h3>
              <p className="text-gray-600">
                Files are uploaded directly to ImageKit CDN with secure
                authentication.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-4">3️⃣</div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Get Optimized URLs
              </h3>
              <p className="text-gray-600">
                Receive optimized image URLs ready for use in your application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
