"use client";

import { useCallback, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { compressImage } from "@/lib/compress-image";

interface UploadEntry {
  id: string;
  name: string;
  progress: number;
}

export function UploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadEntry[]>([]);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const valid = files.filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
      );
      if (!valid.length) return;

      const ready = await Promise.all(
        valid.map((f) => f.type.startsWith("image/") ? compressImage(f) : Promise.resolve(f))
      );

      const entries: UploadEntry[] = ready.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        name: f.name,
        progress: 0,
      }));
      setUploads((prev) => [...prev, ...entries]);

      await Promise.all(
        ready.map(async (file, i) => {
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

  return (
    <div className="w-full max-w-2xl space-y-3">
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 text-primary-foreground text-base font-semibold shadow-sm active:scale-95 transition-transform select-none"
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus size={22} />
        Lisää kuvia tai videoita
      </button>
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
