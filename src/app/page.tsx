import { list } from "@vercel/blob";
import type { ListBlobResultBlob } from "@vercel/blob";
import { Badge } from "@/components/ui/badge";
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
      <div className="text-center space-y-2 mt-8">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Party Memories
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Your Memories</h1>
        <p className="text-muted-foreground text-sm">
          Drop in photos and videos to save them forever.
        </p>
      </div>

      <UploadZone />

      {blobs.length === 0 ? (
        <p className="text-muted-foreground text-sm pt-4">
          No memories yet — upload your first one above.
        </p>
      ) : (
        <MediaGrid blobs={blobs} />
      )}
    </main>
  );
}
