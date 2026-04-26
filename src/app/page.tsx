import { list } from "@vercel/blob";
import type { ListBlobResultBlob } from "@vercel/blob";
import { MapPin, Clock, CalendarHeart } from "lucide-react";
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
    <main className="flex min-h-screen flex-col items-center gap-10 p-8">
      <section className="w-full max-w-2xl mt-8 text-center space-y-6">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">
            Tervetuloa juhlimaan
          </p>
          <h1 className="text-5xl font-bold tracking-tight">
            Aavan ristiäiset
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarHeart className="size-4 shrink-0" />
            Sunnuntai 26. huhtikuuta 2026
          </span>
          <span className="hidden sm:block text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 shrink-0" />
            Klo 16:00 alkaen
          </span>
          <span className="hidden sm:block text-border">·</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            Huhtakoti
          </span>
        </div>

        <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
          Jaa juhlasta ottamasi kuvat ja videot tänne — rakennetaan yhdessä
          muisto tästä erityisestä päivästä.
        </p>
      </section>

      <div className="w-full max-w-2xl border-t border-border" />

      <UploadZone />

      {blobs.length === 0 ? (
        <p className="text-muted-foreground text-sm pt-4">
          Ei muistoja vielä — lisää ensimmäinen kuva tai video yllä.
        </p>
      ) : (
        <MediaGrid blobs={blobs} />
      )}
    </main>
  );
}
