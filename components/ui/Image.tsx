"use client";

import { Image } from "@imagekit/next";
export interface ImageKitProps {
  path?: string;
  w?: number;
  h?: number;
  alt?: string;
  className?: string;
}
export default function ImageKit({
  path,
  w,
  h,
  alt,
  className,
}: ImageKitProps) {
  return (
    <div>
      <h1>Demo ImageKit Next</h1>
      <Image
        urlEndpoint="https://ik.imagekit.io/tudxtwork524/" // URL endpoint của bạn
        src={path || ""} // path ảnh trên ImageKit
        alt={alt || ""}
        width={w}
        height={h}
        className={className}
        loading="lazy"
        // responsive={true}
      />
    </div>
  );
}
