"use client";

import { SecurityThreatLevel } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface SecurityBadgeProps {
  threatLevel: SecurityThreatLevel;
  isSecure: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SecurityBadge({
  threatLevel,
  isSecure,
  showIcon = true,
  size = "md",
}: SecurityBadgeProps) {
  const getIcon = () => {
    if (isSecure) {
      return <ShieldCheck className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />;
    }
    if (threatLevel === "critical" || threatLevel === "high") {
      return <ShieldAlert className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />;
    }
    return <Shield className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />;
  };

  const getColor = () => {
    if (isSecure) return "text-green-600";
    switch (threatLevel) {
      case "low":
        return "text-blue-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getText = () => {
    if (isSecure) return "🛡️ Protected";
    return "⚠️ Risk Detected";
  };

  return (
    <Badge variant="outline" className={`${getColor()} flex items-center gap-1`}>
      {showIcon && getIcon()}
      <span className={size === "sm" ? "text-xs" : "text-sm"}>{getText()}</span>
    </Badge>
  );
}
