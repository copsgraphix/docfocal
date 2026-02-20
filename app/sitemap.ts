import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://docfocal.com";
  const now = new Date();

  return [
    { url: base,                        lastModified: now, changeFrequency: "weekly",  priority: 1.0  },
    { url: `${base}/login`,             lastModified: now, changeFrequency: "monthly", priority: 0.5  },
    { url: `${base}/signup`,            lastModified: now, changeFrequency: "monthly", priority: 0.5  },
    { url: `${base}/privacy`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3  },
    { url: `${base}/terms`,             lastModified: now, changeFrequency: "yearly",  priority: 0.3  },
    // These are behind auth but still help crawlers discover structure
    { url: `${base}/dashboard`,         lastModified: now, changeFrequency: "monthly", priority: 0.8  },
    { url: `${base}/dashboard/pdf-editor`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/dashboard/pdf/merge`,       lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/dashboard/pdf/split`,       lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/dashboard/pdf/compress`,    lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/dashboard/pdf/watermark`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/dashboard/pdf/sign`,        lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/dashboard/pdf/to-word`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/dashboard/pdf/to-jpeg`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
