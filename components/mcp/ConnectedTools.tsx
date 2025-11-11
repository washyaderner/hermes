"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MCPServer, MCPTool, ConnectionTemplate } from "@/types";
import { detectMCPServers, getMCPStatus } from "@/lib/mcp/detector";
import { ALL_TEMPLATES, getTemplatesByCategory } from "@/lib/mcp/templates";
import {
  Plug,
  PlugZap,
  FileCode,
  Globe,
  Database,
  Cpu,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";

interface ConnectedToolsProps {
  onTemplateSelect?: (template: ConnectionTemplate) => void;
  compact?: boolean;
}

export function ConnectedTools({ onTemplateSelect, compact = false }: ConnectedToolsProps) {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [status, setStatus] = useState<{
    available: boolean;
    message: string;
    serversConnected: number;
    totalTools: number;
  } | null>(null);
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadMCPData();
  }, []);

  const loadMCPData = async () => {
    const detectedServers = await detectMCPServers();
    const mcpStatus = await getMCPStatus();
    setServers(detectedServers);
    setStatus(mcpStatus);
  };

  const toggleServerExpanded = (serverId: string) => {
    const newExpanded = new Set(expandedServers);
    if (newExpanded.has(serverId)) {
      newExpanded.delete(serverId);
    } else {
      newExpanded.add(serverId);
    }
    setExpandedServers(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "filesystem":
        return <FileCode className="h-4 w-4" />;
      case "web":
        return <Globe className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      default:
        return <Cpu className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "disconnected":
        return "bg-gray-500/10 text-gray-600 border-gray-500/30";
      case "connecting":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "error":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      default:
        return "";
    }
  };

  const filteredTemplates =
    selectedCategory === "all"
      ? ALL_TEMPLATES
      : getTemplatesByCategory(selectedCategory);

  // Compact view
  if (compact) {
    return (
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <PlugZap className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">Connected Tools</div>
              <div className="text-xs text-muted-foreground">
                {status?.message || "Loading..."}
              </div>
            </div>
            {status && status.serversConnected > 0 && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                {status.totalTools} tools
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlugZap className="h-5 w-5" />
            MCP Tool Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Message */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="flex-1 text-sm text-blue-700">
                  {status?.message || "Loading MCP status..."}
                </div>
              </div>
            </div>

            {/* Servers List */}
            <div className="space-y-3">
              {servers.map((server) => (
                <div
                  key={server.serverId}
                  className="border rounded-lg overflow-hidden"
                >
                  <div
                    className="p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleServerExpanded(server.serverId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Plug className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{server.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {server.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getStatusColor(server.status)}
                        >
                          {server.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {server.tools.length} tools
                        </Badge>
                        {expandedServers.has(server.serverId) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Tools */}
                  {expandedServers.has(server.serverId) && (
                    <div className="p-3 space-y-2 border-t">
                      {server.tools.map((tool) => (
                        <div
                          key={tool.toolId}
                          className="p-2 bg-background rounded border"
                        >
                          <div className="flex items-start gap-2">
                            {getCategoryIcon(tool.category)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{tool.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {tool.description}
                              </div>
                              {tool.examples.length > 0 && (
                                <div className="mt-1 text-xs italic text-muted-foreground">
                                  Example: {tool.examples[0]}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {tool.category}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Connection Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              <Button
                variant={selectedCategory === "filesystem" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("filesystem")}
              >
                <FileCode className="h-3 w-3 mr-1" />
                Filesystem
              </Button>
              <Button
                variant={selectedCategory === "web" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("web")}
              >
                <Globe className="h-3 w-3 mr-1" />
                Web
              </Button>
              <Button
                variant={selectedCategory === "database" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("database")}
              >
                <Database className="h-3 w-3 mr-1" />
                Database
              </Button>
            </div>

            {/* Templates List */}
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.templateId}
                  className="p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      {getCategoryIcon(template.category)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm mb-1">
                          {template.name}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {template.description}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {template.serverType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.examples.length} examples
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTemplateSelect && onTemplateSelect(template)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
