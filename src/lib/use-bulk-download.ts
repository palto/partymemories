"use client";

import { useState, useCallback, useRef } from "react";
import { zipSync } from "fflate";
import type { ListBlobResultBlob } from "@vercel/blob";

export type BulkDownloadState =
  | { status: "idle" }
  | { status: "downloading"; done: number; total: number }
  | { status: "zipping" }
  | { status: "done" }
  | { status: "error"; message: string };

export function useBulkDownload(zipName = "party-memories.zip") {
  const [state, setState] = useState<BulkDownloadState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const download = useCallback(
    async (blobs: ListBlobResultBlob[]) => {
      if (blobs.length === 0) return;

      const controller = new AbortController();
      abortRef.current = controller;

      setState({ status: "downloading", done: 0, total: blobs.length });

      try {
        const files: Record<string, Uint8Array> = {};
        const seen = new Map<string, number>();

        for (let i = 0; i < blobs.length; i++) {
          if (controller.signal.aborted) break;

          const blob = blobs[i];
          let name = blob.pathname.split("/").pop() ?? `file-${i}`;

          // Deduplicate filenames
          const prev = seen.get(name) ?? 0;
          seen.set(name, prev + 1);
          if (prev > 0) {
            const dot = name.lastIndexOf(".");
            name =
              dot !== -1
                ? `${name.slice(0, dot)}-${prev}${name.slice(dot)}`
                : `${name}-${prev}`;
          }

          const res = await fetch(blob.url, { signal: controller.signal });
          const buf = await res.arrayBuffer();
          files[name] = new Uint8Array(buf);

          setState({ status: "downloading", done: i + 1, total: blobs.length });
        }

        if (controller.signal.aborted) {
          setState({ status: "idle" });
          return;
        }

        setState({ status: "zipping" });
        const zipped = zipSync(files, { level: 0 });

        const url = URL.createObjectURL(
          new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" }),
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = zipName;
        a.click();
        URL.revokeObjectURL(url);

        setState({ status: "done" });
        setTimeout(() => setState({ status: "idle" }), 3000);
      } catch (err) {
        if (controller.signal.aborted) {
          setState({ status: "idle" });
          return;
        }
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Lataus epäonnistui",
        });
        setTimeout(() => setState({ status: "idle" }), 4000);
      }
    },
    [zipName],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { state, download, abort };
}
