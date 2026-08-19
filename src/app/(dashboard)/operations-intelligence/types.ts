import type { ComponentType } from "react";
import type {
  OperationalAlert,
  OperationalRecommendation,
  PressureArea,
} from "@/infrastructure/services/operations-intelligence.service";

/**
 * Types shared between the page and its presentational cards.
 * They lived inside page.tsx, which is why the cards could not be extracted.
 */
export type DecisionRowData = PressureArea & {
  recommendation?: OperationalRecommendation;
  providersNeeded: number;
  expectedRelief: number;
  decisionPriority: "critical" | "high" | "medium";
};

export type SectionTitleProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
};

export type RecommendationCardProps = {
  item: OperationalRecommendation;
  canManage: boolean;
  isPending: boolean;
  onStatus: (status: string) => void;
  onNote: () => void;
};

export type AlertCardProps = {
  alert: OperationalAlert;
  canManage: boolean;
  onRead: () => void;
  onResolve: () => void;
};
