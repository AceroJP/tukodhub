// ─────────────────────────────────────────────────────────────────────────────
// TukodHub Website Builder — Complete Type Schema
// Schema Version: 2.0.0
// ─────────────────────────────────────────────────────────────────────────────

export type SectionType =
  | "announcement"
  | "hero"
  | "workflow"
  | "field_features"
  | "services"
  | "about"
  | "statistics"
  | "testimonials"
  | "pricing"
  | "faq"
  | "cta"
  | "contact";

export type BackgroundTone =
  | "white"
  | "cream"
  | "sand"
  | "forest-dark"
  | "muted-green";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "gold";

// ── Reusable Primitive Blocks ─────────────────────────────────────────────────

export type ButtonBlock = {
  id: string;
  label: string;
  url: string;
  variant: ButtonVariant;
  target?: "_self" | "_blank";
  iconName?: string;
  enabled: boolean;
};

export type CardBlock = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  iconName?: string;
  imageUrl?: string;
  imageAlt?: string;
  buttons?: ButtonBlock[];
  enabled: boolean;
};

export type StatBlock = {
  id: string;
  value: string;
  label: string;
  helperText?: string;
  trend?: string;
  enabled: boolean;
};

export type AccordionBlock = {
  id: string;
  question: string;
  answer: string;
  isDefaultOpen?: boolean;
  enabled: boolean;
};

export type PricingTierBlock = {
  id: string;
  name: string;
  priceMonthly: string;
  priceAnnual: string;
  description: string;
  isFeatured: boolean;
  featuredBadge?: string;
  features: string[];
  ctaButton: ButtonBlock;
  enabled: boolean;
};

export type TestimonialBlock = {
  id: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  quote: string;
  avatarUrl?: string;
  rating?: number; // 1 - 5
  enabled: boolean;
};

// ── Global Document Settings ──────────────────────────────────────────────────

export type WebsiteGlobalSettings = {
  brandName: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: "Inter" | "SystemSans";
  showAmbientBlobs: boolean;
  socialLinks: Array<{
    platform: "facebook" | "twitter" | "linkedin" | "instagram";
    url: string;
  }>;
  contactEmail?: string;
  contactPhone?: string;
};

// ── Pinned Structural Elements ────────────────────────────────────────────────

export type NavLink = {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
};

export type NavigationHeaderConfig = {
  enabled: boolean;
  brandName: string;
  logoType: "badge_letter" | "image" | "text_only";
  badgeLetter?: string;
  logoImageUrl?: string;
  links: NavLink[];
  buttons: ButtonBlock[];
};

export type FooterConfig = {
  enabled: boolean;
  brandName: string;
  copyrightText: string;
  links: NavLink[];
  footnote?: string;
};

// ── Main Content Section Schemas ──────────────────────────────────────────────

export type BaseSectionConfig = {
  id: string;
  type: SectionType;
  enabled: boolean;
  anchorId?: string;
  backgroundTone: BackgroundTone;
};

export type AnnouncementSectionConfig = BaseSectionConfig & {
  type: "announcement";
  badge: string;
  text: string;
  linkUrl?: string;
};

export type HeroSectionConfig = BaseSectionConfig & {
  type: "hero";
  eyebrowBadge?: { text: string; dotColor?: string };
  headline: string;
  subheadline: string;
  buttons: ButtonBlock[];
  footnote?: string;
  showOperatingRhythmWidget: boolean;
  imageUrl?: string;
  imageAlt?: string;
};

export type WorkflowSectionConfig = BaseSectionConfig & {
  type: "workflow";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cards: CardBlock[];
};

export type FieldFeaturesSectionConfig = BaseSectionConfig & {
  type: "field_features";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cards: CardBlock[];
};

export type ServicesSectionConfig = BaseSectionConfig & {
  type: "services";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cards: CardBlock[];
};

export type AboutSectionConfig = BaseSectionConfig & {
  type: "about";
  eyebrow?: string;
  title: string;
  body: string;
  stats?: StatBlock[];
  imageUrl?: string;
  imageAlt?: string;
};

export type StatisticsSectionConfig = BaseSectionConfig & {
  type: "statistics";
  eyebrow?: string;
  title?: string;
  stats: StatBlock[];
};

export type TestimonialsSectionConfig = BaseSectionConfig & {
  type: "testimonials";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  testimonials: TestimonialBlock[];
};

export type PricingSectionConfig = BaseSectionConfig & {
  type: "pricing";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  billingToggle: {
    monthlyLabel: string;
    annualLabel: string;
    discountBadge?: string;
  };
  tiers: PricingTierBlock[];
};

export type FaqSectionConfig = BaseSectionConfig & {
  type: "faq";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: AccordionBlock[];
};

export type CtaSectionConfig = BaseSectionConfig & {
  type: "cta";
  eyebrow?: string;
  headline: string;
  description: string;
  buttons: ButtonBlock[];
};

export type ContactSectionConfig = BaseSectionConfig & {
  type: "contact";
  eyebrow?: string;
  title: string;
  description: string;
  emailLabel?: string;
  emailValue?: string;
  phoneLabel?: string;
  phoneValue?: string;
  addressLabel?: string;
  addressValue?: string;
};

export type ContentSectionConfig =
  | AnnouncementSectionConfig
  | HeroSectionConfig
  | WorkflowSectionConfig
  | FieldFeaturesSectionConfig
  | ServicesSectionConfig
  | AboutSectionConfig
  | StatisticsSectionConfig
  | TestimonialsSectionConfig
  | PricingSectionConfig
  | FaqSectionConfig
  | CtaSectionConfig
  | ContactSectionConfig;

// ── Master Document Schema ────────────────────────────────────────────────────

export type WebsitePageDocument = {
  schemaVersion: 2;
  version: number;
  publishedVersionId?: string;
  publishedAt?: string;
  updatedAt: string;
  globals: WebsiteGlobalSettings;
  header: NavigationHeaderConfig;
  sections: ContentSectionConfig[];
  footer: FooterConfig;
};

// ── Interactive Preview Options ───────────────────────────────────────────────

export type InteractivePreviewOptions = {
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  hoveredSectionId?: string | null;
  onHoverSection?: (sectionId: string | null) => void;
  selectedElementId?: string | null;
  onSelectElement?: (elementId: string | null, parentSectionId?: string) => void;
  hoveredElementId?: string | null;
  onHoverElement?: (elementId: string | null) => void;
};
