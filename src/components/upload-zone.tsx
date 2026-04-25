"use client";

import { useCallback, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UploadEntry {
  id: string;
  name: string;
  progress: number;
}

export function UploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadEntry[]>([]);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const valid = files.filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
      );
      if (!valid.length) return;

      const entries: UploadEntry[] = valid.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        name: f.name,
        progress: 0,
      }));
      setUploads((prev) => [...prev, ...entries]);

      await Promise.all(
        valid.map(async (file, i) => {
          const id = entries[i].id;
          try {
            await upload(file.name, file, {
              access: "public",
              handleUploadUrl: "/api/upload",
              multipart: file.size > 10 * 1024 * 1024,
              onUploadProgress: ({ percentage }) => {
                setUploads((prev) =>
                  prev.map((u) =>
                    u.id === id ? { ...u, progress: percentage } : u
                  )
                );
              },
            });
          } catch (e) {
            console.error("Upload failed:", e);
          } finally {
            setUploads((prev) => prev.filter((u) => u.id !== id));
          }
        })
      );

      router.refresh();
    },
    [router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(Array.from(e.dataTransfer.files));
    },
    [handleFiles]
  );

  return (
    <div className="w-full max-w-2xl space-y-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors select-none",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,video/*"
          onChange={(e) =>
            e.target.files && handleFiles(Array.from(e.target.files))
          }
        />
        <p className="text-3xl mb-3">📎</p>
        <p className="text-sm font-medium">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">
          Images and videos · up to 500 MB each
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((u) => (
            <div key={u.id} className="flex items-center gap-3">
              <span className="text-sm truncate flex-1 min-w-0">{u.name}</span>
              <div className="w-28 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                <div
                  className="h-full bg-primary transition-all duration-150"
                  style={{ width: `${u.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
                {u.progress}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
