"use client";

import { useState } from "react";
import type { ListBlobResultBlob } from "@vercel/blob";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv)$/i;

function VideoTile({
  blob,
  onOpen,
}: {
  blob: ListBlobResultBlob;
  onOpen: () => void;
}) {
  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
      onClick={onOpen}
    >
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

function ImageTile({
  blob,
  onOpen,
}: {
  blob: ListBlobResultBlob;
  onOpen: () => void;
}) {
  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
      onClick={onOpen}
    >
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
  const [selected, setSelected] = useState<ListBlobResultBlob | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const isVideo = selected ? VIDEO_EXTENSIONS.test(selected.pathname) : false;

  function open(blob: ListBlobResultBlob) {
    setDims(null);
    setSelected(blob);
  }

  function close() {
    setSelected(null);
    setDims(null);
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-5xl">
        {blobs.map((blob) =>
          VIDEO_EXTENSIONS.test(blob.pathname) ? (
            <VideoTile key={blob.url} blob={blob} onOpen={() => open(blob)} />
          ) : (
            <ImageTile key={blob.url} blob={blob} onOpen={() => open(blob)} />
          )
        )}
      </div>

      <Dialog open={selected !== null} onOpenChange={(isOpen) => { if (!isOpen) close(); }}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 flex flex-col items-center gap-2 bg-black/90 border-none rounded-2xl">
          {selected && (isVideo ? (
            <video
              key={selected.url}
              src={selected.url}
              controls
              autoPlay
              className="max-w-[90vw] max-h-[85vh] rounded-lg"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={selected.url}
              src={selected.url}
              alt={selected.pathname.split("/").pop() ?? ""}
              className="max-w-[90vw] max-h-[85vh] rounded-lg object-contain"
              onLoad={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                setDims({ w: img.naturalWidth, h: img.naturalHeight });
              }}
            />
          ))}
          {selected && !isVideo && (
            <p className="text-white/50 text-xs text-center tabular-nums">
              {selected.pathname.split("/").pop()}
              {dims && <>&nbsp;·&nbsp;{dims.w}×{dims.h}</>}
              &nbsp;·&nbsp;{formatBytes(selected.size)}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
