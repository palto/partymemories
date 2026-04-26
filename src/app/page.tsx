import { list } from "@vercel/blob";
import type { ListBlobResultBlob } from "@vercel/blob";
import { MapPin, Clock, CalendarHeart } from "lucide-react";
import Image from "next/image";
import { UploadZone } from "@/components/upload-zone";
import { MediaGrid } from "@/components/media-grid";

export const dynamic = "force-dynamic";

async function getBlobs(): Promise<ListBlobResultBlob[]> {
  try {
    const { blobs } = await list();
    return blobs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  } catch {
    return [];
  }
}

export default async function Home() {
  const blobs = await getBlobs();

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <section className="w-full max-w-2xl mt-4 text-center space-y-3">
        <div className="flex justify-center">
          <Image
            src="https://yzscvkujys6lbqov.public.blob.vercel-storage.com/aava.jpeg"
            alt="Aava"
            width={96}
            height={96}
            className="rounded-full object-cover shadow-md"
            priority
          />
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">
            Tervetuloa juhlimaan
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Aavan ristiäiset
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarHeart className="size-4 shrink-0" />
            Sunnuntai 26. huhtikuuta 2026
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 shrink-0" />
            Klo 16:00 alkaen
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            Huhtakoti
          </span>
        </div>
      </section>

      <div className="w-full max-w-2xl border-t border-border" />

      {blobs.length === 0 ? (
        <>
          <p className="text-muted-foreground text-sm">
            Ei muistoja vielä — lisää ensimmäinen kuva tai video alle.
          </p>
          <UploadZone />
        </>
      ) : (
        <>
          <MediaGrid blobs={blobs} />
          <UploadZone />
        </>
      )}
    </main>
  );
}
