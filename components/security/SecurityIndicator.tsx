"use client";

import { SecurityScanResult, SecurityThreatLevel } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Info, X } from "lucide-react";
import { useState } from "react";

interface SecurityIndicatorProps {
  scanResult: SecurityScanResult | null;
  compact?: boolean;
  onDismiss?: () => void;
}

export function SecurityIndicator({
  scanResult,
  compact = false,
  onDismiss,
}: SecurityIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  if (!scanResult) return null;

  const getThreatLevelIcon = (level: SecurityThreatLevel) => {
    switch (level) {
      case "safe":
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case "low":
        return <Shield className="h-5 w-5 text-blue-500" />;
      case "medium":
        return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      case "high":
        return <ShieldAlert className="h-5 w-5 text-orange-500" />;
      case "critical":
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
    }
  };

  const getThreatLevelColor = (level: SecurityThreatLevel) => {
    switch (level) {
      case "safe":
        return "bg-green-500/10 border-green-500/30 text-green-700";
      case "low":
        return "bg-blue-500/10 border-blue-500/30 text-blue-700";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-700";
      case "high":
        return "bg-orange-500/10 border-orange-500/30 text-orange-700";
      case "critical":
        return "bg-red-500/10 border-red-500/30 text-red-700";
    }
  };

  const getThreatLevelText = (level: SecurityThreatLevel) => {
    switch (level) {
      case "safe":
        return "Secure";
      case "low":
        return "Low Risk";
      case "medium":
        return "Medium Risk";
      case "high":
        return "High Risk";
      case "critical":
        return "Critical Risk";
    }
  };

  // Compact mode - just show icon and badge
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getThreatLevelIcon(scanResult.threatLevel)}
        <Badge variant="outline" className={getThreatLevelColor(scanResult.threatLevel)}>
          {scanResult.isSecure ? "🛡️ Protected" : "⚠️ Threats Detected"}
        </Badge>
      </div>
    );
  }

  // Full mode - detailed card
  if (scanResult.isSecure && scanResult.appliedProtections.length === 0) {
    // Don't show anything if secure and no protections applied
    return null;
  }

  return (
    <Card className={`border-l-4 ${getThreatLevelColor(scanResult.threatLevel)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {getThreatLevelIcon(scanResult.threatLevel)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">
                  Security Scan: {getThreatLevelText(scanResult.threatLevel)}
                </span>
                {scanResult.threats.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {scanResult.threats.length} threat{scanResult.threats.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {/* Warnings */}
              {scanResult.warnings.length > 0 && (
                <div className="space-y-1 mb-2">
                  {scanResult.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Applied Protections */}
              {scanResult.appliedProtections.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium mb-1 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Protections Applied:
                  </div>
                  <div className="space-y-1">
                    {scanResult.appliedProtections.slice(0, expanded ? undefined : 3).map((protection, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground pl-4">
                        • {protection}
                      </div>
                    ))}
                  </div>
                  {scanResult.appliedProtections.length > 3 && !expanded && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs mt-1"
                      onClick={() => setExpanded(true)}
                    >
                      Show {scanResult.appliedProtections.length - 3} more...
                    </Button>
                  )}
                </div>
              )}

              {/* Detailed Threats (expandable) */}
              {scanResult.threats.length > 0 && (
                <div>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => setExpanded(!expanded)}
                  >
                    <Info className="h-3 w-3 mr-1" />
                    {expanded ? "Hide" : "Show"} threat details
                  </Button>

                  {expanded && (
                    <div className="mt-2 space-y-2">
                      {scanResult.threats.map((threat, idx) => (
                        <div
                          key={threat.threatId}
                          className="p-2 bg-background/50 rounded border text-xs"
                        >
                          <div className="font-medium mb-1">
                            {idx + 1}. {threat.type.replace(/-/g, " ").toUpperCase()}
                          </div>
                          <div className="text-muted-foreground mb-1">
                            Match: &quot;{threat.match}&quot;
                          </div>
                          <div className="text-muted-foreground italic">
                            💡 {threat.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sanitized Prompt Preview */}
              {scanResult.sanitizedPrompt && scanResult.sanitizedPrompt !== "" && (
                <div className="mt-2">
                  <div className="text-xs font-medium mb-1">Sanitized version available</div>
                  <div className="text-xs text-muted-foreground italic">
                    Dangerous patterns have been removed or escaped
                  </div>
                </div>
              )}
            </div>
          </div>

          {onDismiss && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onDismiss}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
