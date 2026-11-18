"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { DynamicLandingPage } from "@/components/landing/DynamicLandingPage";
import { migrateLegacyLandingConfig } from "@/lib/legacyLandingMigration";
import type { WebsitePageDocument } from "@/types/landingBuilder";

export default function Home() {
  const [document, setDocument] = useState<WebsitePageDocument>(() =>
    migrateLegacyLandingConfig({})
  );

  useEffect(() => {
    async function loadPublicLandingConfig() {
      try {
        const data = await apiRequest<{ key: string; valueJson: string | null }>(
          "/api/v1/platform/landing-page/public"
        );
        if (data.valueJson) {
          const parsed = JSON.parse(data.valueJson);
          const migrated = migrateLegacyLandingConfig(parsed);
          setDocument(migrated);
        }
      } catch {
        // Gracefully retains canonical grounded database state if API is cold
      }
    }
    void loadPublicLandingConfig();
  }, []);

  return <DynamicLandingPage document={document} />;
}
