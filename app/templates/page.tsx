"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplatesPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("hermes_auth");
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface">
      <nav className="border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-xl">
              ⚡
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Hermes
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Prompt Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Coming Soon
              </h3>
              <p className="text-muted-foreground">
                Template library will be available in the next update
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
