import metadataJson from "./metadata.json";

export interface ProductMetadata {
  id: string;
  workingTitle: string;
  subtitle: string;
  author: {
    name: string;
    role: string;
    url: string;
  };
  version: string;
  publicationStatus: "in_development" | "draft" | "release_candidate" | "published";
  description: string;
  targetAudience: string;
  technologies: {
    framework: string;
    targetVersion: string;
    reactVersion: string;
    nodeRequirement: string;
    language: string;
    styling: string;
  };
  copyright: string;
  licenseNotice: string;
}

export const PRODUCT_METADATA: ProductMetadata = metadataJson as ProductMetadata;
export default PRODUCT_METADATA;
