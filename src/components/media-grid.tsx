"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ListBlobResultBlob } from "@vercel/blob";
import { Download, MoreVertical, Share2, Trash2, X } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv)$/i;

const canWebShare =
  typeof navigator !== "undefined" && typeof navigator.canShare === "function";

async function downloadBlob(blob: ListBlobResultBlob) {
  const filename = blob.pathname.split("/").pop() ?? "download";
  const res = await fetch(blob.url);
  const data = await res.blob();
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareBlob(blob: ListBlobResultBlob) {
  const filename = blob.pathname.split("/").pop() ?? "download";
  const res = await fetch(blob.url);
  const data = await res.blob();
  const file = new File([data], filename, { type: data.type });
  if (navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: filename });
  }
}

function MediaMenu({
  blob,
  onDelete,
}: {
  blob: ListBlobResultBlob;
  onDelete: () => void;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className="p-2 text-white/80 hover:text-white transition-colors"
        aria-label="Lisää toimintoja"
      >
        <MoreVertical size={20} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={4}
          className="z-[60]"
        >
          <Menu.Popup className="min-w-36 rounded-2xl bg-white py-1 shadow-lg outline-none dark:bg-neutral-900">
            <Menu.Item
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-neutral-800 outline-none hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              onClick={() => downloadBlob(blob)}
            >
              <Download size={15} />
              Lataa
            </Menu.Item>
            <Menu.Separator className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />
            <Menu.Item
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-500 outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={onDelete}
            >
              <Trash2 size={15} />
              Poista
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

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

function ImageLightbox({
  blob,
  onClose,
  onDelete,
}: {
  blob: ListBlobResultBlob;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black touch-none">
      {/* top bar */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <button
          className="pointer-events-auto p-2 text-white/80 hover:text-white transition-colors"
          onClick={onClose}
          aria-label="Sulje"
        >
          <X size={24} />
        </button>
        <div className="pointer-events-auto flex items-center gap-1">
          {canWebShare && (
            <button
              className="p-2 text-white/80 hover:text-white transition-colors"
              onClick={() => shareBlob(blob)}
              aria-label="Jaa"
            >
              <Share2 size={20} />
            </button>
          )}
          <MediaMenu blob={blob} onDelete={onDelete} />
        </div>
      </div>

      {/* zoomable image — double-tap or pinch to zoom */}
      <TransformWrapper
        key={blob.url}
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        doubleClick={{ mode: "toggle" }}
        centerOnInit
      >
        <TransformComponent
          wrapperStyle={{ width: "100vw", height: "100dvh" }}
          contentStyle={{ width: "100vw", height: "100dvh" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blob.url}
            alt={blob.pathname.split("/").pop() ?? ""}
            style={{ width: "100vw", height: "100dvh", objectFit: "contain" }}
            onLoad={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              setDims({ w: img.naturalWidth, h: img.naturalHeight });
            }}
          />
        </TransformComponent>
      </TransformWrapper>

      {/* bottom metadata */}
      <div className="absolute bottom-0 inset-x-0 z-10 p-3 pb-safe bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
        <p className="text-white/50 text-xs tabular-nums text-center">
          {dims ? (
            <>
              {dims.w}×{dims.h}&nbsp;·&nbsp;
            </>
          ) : null}
          {formatBytes(blob.size)}
          &nbsp;·&nbsp;
          {(blob.pathname.match(/\.([^.]+)$/) ?? [])[1]?.toUpperCase() ?? "?"}
        </p>
      </div>
    </div>
  );
}

function VideoLightbox({
  blob,
  onClose,
  onDelete,
}: {
  blob: ListBlobResultBlob;
  onClose: () => void;
  onDelete: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <button
          className="pointer-events-auto p-2 text-white/80 hover:text-white transition-colors"
          onClick={onClose}
          aria-label="Sulje"
        >
          <X size={24} />
        </button>
        <div className="pointer-events-auto flex items-center gap-1">
          {canWebShare && (
            <button
              className="p-2 text-white/80 hover:text-white transition-colors"
              onClick={() => shareBlob(blob)}
              aria-label="Jaa"
            >
              <Share2 size={20} />
            </button>
          )}
          <MediaMenu blob={blob} onDelete={onDelete} />
        </div>
      </div>
      <video
        key={blob.url}
        src={blob.url}
        controls
        autoPlay
        playsInline
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export function MediaGrid({ blobs }: { blobs: ListBlobResultBlob[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ListBlobResultBlob | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ListBlobResultBlob | null>(
    null,
  );
  const isVideo = selected ? VIDEO_EXTENSIONS.test(selected.pathname) : false;
  const pendingDeleteIsVideo = pendingDelete
    ? VIDEO_EXTENSIONS.test(pendingDelete.pathname)
    : false;

  function open(blob: ListBlobResultBlob) {
    setSelected(blob);
  }

  function close() {
    setSelected(null);
  }

  function confirmDelete() {
    const blob = selected;
    close();
    setPendingDelete(blob);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await fetch("/api/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: pendingDelete.url }),
    });
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-5xl">
        {blobs.map((blob) =>
          VIDEO_EXTENSIONS.test(blob.pathname) ? (
            <VideoTile key={blob.url} blob={blob} onOpen={() => open(blob)} />
          ) : (
            <ImageTile key={blob.url} blob={blob} onOpen={() => open(blob)} />
          ),
        )}
      </div>

      {selected && !isVideo && (
        <ImageLightbox
          blob={selected}
          onClose={close}
          onDelete={confirmDelete}
        />
      )}
      {selected && isVideo && (
        <VideoLightbox
          blob={selected}
          onClose={close}
          onDelete={confirmDelete}
        />
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Poistetaanko tämä {pendingDeleteIsVideo ? "video" : "kuva"}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Toimintoa ei voi peruuttaa.
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Peruuta
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Poista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
