import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center space-y-3">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Welcome
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Party Memories
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Capture, share, and relive your best party moments with friends and family.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl">📸</CardTitle>
            <CardTitle className="text-base">Capture</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Save photos and videos from every celebration.</CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl">🎉</CardTitle>
            <CardTitle className="text-base">Relive</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Browse your memories by event, date, or people.</CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl">🤝</CardTitle>
            <CardTitle className="text-base">Share</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Invite guests to contribute their own shots.</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Button size="lg" className="mt-2">
        Get Started
      </Button>
    </main>
  );
}
