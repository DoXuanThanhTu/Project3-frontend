// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import {
//   Upload,
//   X,
//   Image as ImageIcon,
//   CheckCircle,
//   AlertCircle,
//   Camera,
// } from "lucide-react";
// import ImageKit from "imagekit-javascript";
// import api from "@/lib/api";

// interface ImageUploadPopupProps {
//   isOpen: boolean;
//   onClose: () => void;
//   type: "avatar" | "cover";
//   onSuccess: (imageUrl: string) => void;
//   currentImageUrl?: string;
// }

// // ImageKit configuration - bạn cần thay thế bằng config thực tế của bạn
// const IMAGEKIT_CONFIG = {
//   publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_xxx",
//   urlEndpoint:
//     process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
//     "https://ik.imagekit.io/your_endpoint",
//   authenticationEndpoint:
//     process.env.NEXT_PUBLIC_IMAGEKIT_AUTH_ENDPOINT || "/api/imagekit-auth",
// };

// const ImageUploadPopup: React.FC<ImageUploadPopupProps> = ({
//   isOpen,
//   onClose,
//   type,
//   onSuccess,
//   currentImageUrl,
// }) => {
//   const [image, setImage] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string>(currentImageUrl || "");
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);
//   const [dragOver, setDragOver] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Khởi tạo ImageKit
//   const imagekit = new ImageKit({
//     publicKey: IMAGEKIT_CONFIG.publicKey,
//     urlEndpoint: IMAGEKIT_CONFIG.urlEndpoint,
//     authenticationEndpoint: IMAGEKIT_CONFIG.authenticationEndpoint,
//   });

//   // Reset state khi mở/đóng popup
//   useEffect(() => {
//     if (isOpen) {
//       setImage(null);
//       setPreview(currentImageUrl || "");
//       setUploadProgress(0);
//       setError(null);
//       setSuccess(false);
//       setDragOver(false);
//     }
//   }, [isOpen, currentImageUrl]);

//   // Xử lý drag and drop
//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDragOver(true);
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDragOver(false);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDragOver(false);

//     const files = e.dataTransfer.files;
//     if (files && files[0]) {
//       handleFileSelect(files[0]);
//     }
//   };

//   // Xử lý chọn file
//   const handleFileSelect = (file: File) => {
//     // Kiểm tra kích thước file (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       setError("Kích thước ảnh không được vượt quá 5MB");
//       return;
//     }

//     // Kiểm tra định dạng file
//     if (!file.type.match("image.*")) {
//       setError("Vui lòng chọn file ảnh");
//       return;
//     }

//     setImage(file);
//     setError(null);

//     // Tạo preview
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setPreview(e.target?.result as string);
//     };
//     reader.readAsDataURL(file);
//   };

//   // Xử lý upload
//   const handleUpload = async () => {
//     if (!image) {
//       setError("Vui lòng chọn ảnh trước khi tải lên");
//       return;
//     }

//     try {
//       setUploading(true);
//       setError(null);
//       setUploadProgress(0);

//       // Lấy authentication token từ server
//       const authResponse = await api.get(
//         IMAGEKIT_CONFIG.authenticationEndpoint
//       );
//       const { token, expire, signature } = authResponse.data;

//       // Upload lên ImageKit
//       const uploadResult = await imagekit.upload({
//         file: image,
//         fileName: `${type}_${Date.now()}.${image.name.split(".").pop()}`,
//         folder:
//           type === "avatar"
//             ? "/movie-website/avatars"
//             : "/movie-website/covers",
//         tags: [type, "user-upload"],
//         useUniqueFileName: true,
//       });

//       // Cập nhật progress
//       setUploadProgress(100);

//       // Cập nhật URL vào database
//       const updateResponse = await api.patch("/profile/me", {
//         [type]: uploadResult.url,
//       });

//       // Thông báo thành công
//       setSuccess(true);

//       // Gọi callback thành công
//       setTimeout(() => {
//         onSuccess(uploadResult.url);
//         onClose();
//       }, 2000);
//     } catch (err: any) {
//       console.error("Upload error:", err);
//       setError(
//         err.response?.data?.message || "Upload thất bại. Vui lòng thử lại."
//       );
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
//         {/* Header */}
//         <div className="relative p-6 border-b border-gray-700">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
//               <Camera size={24} className="text-white" />
//             </div>
//             <div>
//               <h2 className="text-xl font-bold text-white">
//                 {type === "avatar"
//                   ? "Cập nhật ảnh đại diện"
//                   : "Cập nhật ảnh bìa"}
//               </h2>
//               <p className="text-sm text-gray-400 mt-1">
//                 {type === "avatar"
//                   ? "Upload ảnh với định dạng JPG, PNG hoặc GIF (tối đa 5MB)"
//                   : "Ảnh bìa nên có tỷ lệ 16:9 và kích thước tối đa 5MB"}
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={onClose}
//             className="absolute right-4 top-4 p-2 hover:bg-gray-800 rounded-lg transition"
//           >
//             <X size={20} className="text-gray-400" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Upload Area */}
//           <div
//             className={`border-2 border-dashed rounded-xl transition-all duration-300 ${
//               dragOver
//                 ? "border-purple-500 bg-purple-500/10"
//                 : "border-gray-600 hover:border-purple-500"
//             }`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <input
//               type="file"
//               ref={fileInputRef}
//               className="hidden"
//               accept="image/*"
//               onChange={(e) => {
//                 if (e.target.files?.[0]) {
//                   handleFileSelect(e.target.files[0]);
//                 }
//               }}
//             />

//             {preview ? (
//               <div className="relative p-6">
//                 <div className="relative overflow-hidden rounded-lg">
//                   <img
//                     src={preview}
//                     alt="Preview"
//                     className={`w-full h-auto object-cover transition-transform duration-500 ${
//                       type === "avatar"
//                         ? "aspect-square rounded-full max-w-64 mx-auto"
//                         : "aspect-video"
//                     }`}
//                   />
//                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
//                     <div className="text-center">
//                       <Upload size={32} className="text-white mx-auto mb-2" />
//                       <p className="text-white font-medium">
//                         Click để chọn ảnh khác
//                       </p>
//                       <p className="text-gray-300 text-sm mt-1">
//                         hoặc kéo thả ảnh vào đây
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="p-12 text-center cursor-pointer">
//                 <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-4">
//                   <ImageIcon size={32} className="text-purple-400" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-white mb-2">
//                   Kéo thả ảnh vào đây
//                 </h3>
//                 <p className="text-gray-400 mb-4">hoặc</p>
//                 <button
//                   type="button"
//                   className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition"
//                 >
//                   Chọn ảnh từ máy
//                 </button>
//                 <p className="text-gray-500 text-sm mt-4">
//                   Hỗ trợ: JPG, PNG, GIF • Tối đa 5MB
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Progress Bar */}
//           {uploading && (
//             <div className="mt-6">
//               <div className="flex justify-between text-sm mb-2">
//                 <span className="text-gray-300">Đang tải lên...</span>
//                 <span className="text-purple-400 font-medium">
//                   {uploadProgress}%
//                 </span>
//               </div>
//               <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
//                   style={{ width: `${uploadProgress}%` }}
//                 />
//               </div>
//             </div>
//           )}

//           {/* Error Message */}
//           {error && (
//             <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 animate-fadeIn">
//               <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
//               <p className="text-red-400 text-sm">{error}</p>
//             </div>
//           )}

//           {/* Success Message */}
//           {success && (
//             <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3 animate-fadeIn">
//               <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
//               <div>
//                 <p className="text-green-400 font-medium">Thành công!</p>
//                 <p className="text-green-400/80 text-sm">
//                   {type === "avatar" ? "Ảnh đại diện" : "Ảnh bìa"} đã được cập
//                   nhật
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex gap-3 mt-6">
//             <button
//               onClick={onClose}
//               className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition font-medium"
//               disabled={uploading}
//             >
//               Hủy
//             </button>
//             <button
//               onClick={handleUpload}
//               disabled={!image || uploading}
//               className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {uploading ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Đang tải lên...
//                 </>
//               ) : (
//                 <>
//                   <Upload size={18} />
//                   Tải lên và cập nhật
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Tips */}
//           <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
//             <h4 className="text-sm font-medium text-gray-300 mb-2">
//               💡 Mẹo tải ảnh đẹp:
//             </h4>
//             <ul className="text-xs text-gray-400 space-y-1">
//               {type === "avatar" ? (
//                 <>
//                   <li>• Ảnh vuông hoặc gần vuông hiển thị tốt nhất</li>
//                   <li>• Kích thước đề xuất: 400x400px hoặc lớn hơn</li>
//                   <li>• Nên dùng ảnh có khuôn mặt rõ ràng</li>
//                 </>
//               ) : (
//                 <>
//                   <li>• Tỷ lệ ảnh đề xuất: 16:9 (rộng hơn dài)</li>
//                   <li>• Kích thước đề xuất: 1920x1080px</li>
//                   <li>• Tránh ảnh có chữ quan trọng ở cạnh</li>
//                 </>
//               )}
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageUploadPopup;
