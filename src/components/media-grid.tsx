"use client";

import type { ListBlobResultBlob } from "@vercel/blob";

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv)$/i;

function VideoTile({ blob }: { blob: ListBlobResultBlob }) {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
      <video
        src={blob.url}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
        onMouseLeave={(e) => {
          const v = e.currentTarget as HTMLVideoElement;
          v.pause();
          v.currentTime = 0;
        }}
      />
      <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-white text-xs">
        ▶
      </div>
      <Overlay blob={blob} />
    </div>
  );
}

function ImageTile({ blob }: { blob: ListBlobResultBlob }) {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={blob.url}
        alt={blob.pathname.split("/").pop() ?? ""}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <Overlay blob={blob} />
    </div>
  );
}

function Overlay({ blob }: { blob: ListBlobResultBlob }) {
  const name = blob.pathname.split("/").pop() ?? blob.pathname;
  const date = new Date(blob.uploadedAt).toLocaleDateString();
  return (
    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
      <p className="text-white text-xs truncate">{name}</p>
      <p className="text-white/70 text-xs">{date}</p>
    </div>
  );
}

export function MediaGrid({ blobs }: { blobs: ListBlobResultBlob[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-5xl">
      {blobs.map((blob) =>
        VIDEO_EXTENSIONS.test(blob.pathname) ? (
          <VideoTile key={blob.url} blob={blob} />
        ) : (
          <ImageTile key={blob.url} blob={blob} />
        )
      )}
    </div>
  );
}
