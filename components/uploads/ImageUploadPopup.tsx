"use client";

import React, { useState } from "react";
import ImageKitUpload from "./ImageKitUpload";
import { UploadResponse } from "@/types/imagekit";
import { Camera, X } from "lucide-react";

interface ImageUploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: "avatar" | "cover";
  onUploadSuccess: (url: string) => void;
  currentImage?: string;
  onUploadComplete?: (files: UploadResponse[]) => void;
}

const ImageUploadPopup: React.FC<ImageUploadPopupProps> = ({
  isOpen,
  onClose,
  type,
  onUploadSuccess,
  currentImage,
  onUploadComplete,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadResponse[]>([]);

  const handleUploadSuccess = (response: UploadResponse) => {
    setUploadHistory((prev) => [response, ...prev.slice(0, 4)]);

    if (onUploadComplete) {
      onUploadComplete([...uploadHistory, response]);
    }
  };

  const getFolder = () => {
    return type === "avatar" ? "/user/avatars" : "/user/covers";
  };

  const getTags = () => {
    return [type, "profile"];
  };

  const getButtonText = () => {
    return type === "avatar" ? "Tải lên ảnh đại diện" : "Tải lên ảnh bìa";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Camera size={20} />
            {type === "avatar" ? "Chỉnh sửa ảnh đại diện" : "Chỉnh sửa ảnh bìa"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Current Image Preview */}
          {currentImage && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ảnh hiện tại:
              </h3>
              <div
                className={`relative ${
                  type === "avatar"
                    ? "w-32 h-32 rounded-full overflow-hidden"
                    : "w-full h-40 rounded-lg overflow-hidden"
                } border border-gray-200 dark:border-gray-700`}
              >
                <img
                  src={currentImage}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Image Upload Component */}
          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <ImageKitUpload
              onUploadSuccess={handleUploadSuccess}
              folder={getFolder()}
              tags={getTags()}
              multiple={false}
              showPreview={true}
              showProgress={true}
              buttonText={getButtonText()}
              maxFileSize={5 * 1024 * 1024} // 5MB
              acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
              //   onUploadStart={() => setUploading(true)}
              //   onUploadEnd={() => setUploading(false)}
              className=""
            />
          </div>

          {/* Guidelines */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              Lưu ý khi upload:
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              {type === "avatar" ? (
                <>
                  <li>• Kích thước đề xuất: 400x400 pixels</li>
                  <li>• Định dạng: JPG, PNG, WebP</li>
                  <li>• Dung lượng tối đa: 5MB</li>
                  <li>• Ảnh vuông sẽ hiển thị tốt nhất</li>
                </>
              ) : (
                <>
                  <li>• Kích thước đề xuất: 1200x400 pixels</li>
                  <li>• Định dạng: JPG, PNG, WebP</li>
                  <li>• Dung lượng tối đa: 5MB</li>
                  <li>• Tỉ lệ 3:1 sẽ hiển thị tốt nhất</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPopup;
