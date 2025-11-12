"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedPrompt, PromptCollection, ShareableLink, PromptNote } from "@/types";
import {
  createShareableLink,
  loadShareableLinks,
  copyShareableURL,
  generateShareableURL,
  deleteShareableLink,
} from "@/lib/collaboration/sharing";
import {
  loadCollections,
  createCollection,
  addPromptToCollection,
  downloadCollection,
  deleteCollection,
} from "@/lib/collaboration/collections";
import { createNote, loadNotes, deleteNote } from "@/lib/collaboration/notes";
import { createVersion, loadVersions, generateDiffSummary } from "@/lib/collaboration/versioning";

interface CollaborationPanelProps {
  currentPrompt?: EnhancedPrompt;
}

export function CollaborationPanel({ currentPrompt }: CollaborationPanelProps) {
  const [view, setView] = useState<"share" | "collections" | "versions" | "notes">("share");
  const [sharedLinks, setSharedLinks] = useState<ShareableLink[]>([]);
  const [collections, setCollections] = useState<PromptCollection[]>([]);
  const [notes, setNotes] = useState<PromptNote[]>([]);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newNote, setNewNote] = useState("");
  const [selectedColor, setSelectedColor] = useState<"yellow" | "blue" | "green" | "red" | "purple">("yellow");

  // Load data on mount
  useEffect(() => {
    setSharedLinks(loadShareableLinks());
    setCollections(loadCollections());
    if (currentPrompt) {
      setNotes(loadNotes(currentPrompt.id));
    }
  }, [currentPrompt]);

  // Handle share creation
  const handleCreateShare = async () => {
    if (!currentPrompt) return;

    const link = createShareableLink(currentPrompt, "current-user", {
      expiresIn: 30, // 30 days
      allowCopy: true,
      isPublic: true,
    });

    const copied = await copyShareableURL(link.shortCode);
    if (copied) {
      alert(`Link copied to clipboard!\n${generateShareableURL(link.shortCode)}`);
    }

    setSharedLinks(loadShareableLinks());
  };

  // Handle collection creation
  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;

    createCollection(newCollectionName, "New collection", "current-user", {
      icon: "📁",
      isPublic: false,
    });

    setCollections(loadCollections());
    setNewCollectionName("");
    setShowNewCollection(false);
  };

  // Handle add to collection
  const handleAddToCollection = (collectionId: string) => {
    if (!currentPrompt) return;

    addPromptToCollection(collectionId, currentPrompt);
    setCollections(loadCollections());
    alert("Added to collection!");
  };

  // Handle download collection
  const handleDownloadCollection = (collectionId: string, format: "json" | "markdown" | "csv") => {
    downloadCollection(collectionId, format);
  };

  // Handle delete collection
  const handleDeleteCollection = (collectionId: string) => {
    if (confirm("Delete this collection?")) {
      deleteCollection(collectionId);
      setCollections(loadCollections());
    }
  };

  // Handle create note
  const handleCreateNote = () => {
    if (!currentPrompt || !newNote.trim()) return;

    createNote(currentPrompt.id, newNote, selectedColor);
    setNotes(loadNotes(currentPrompt.id));
    setNewNote("");
  };

  // Handle delete note
  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    if (currentPrompt) {
      setNotes(loadNotes(currentPrompt.id));
    }
  };

  if (!currentPrompt && view !== "collections") {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">
          Enhance a prompt first to use collaboration features
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤝</span>
          <h3 className="font-semibold">Collaboration</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "share" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("share")}
          >
            Share
          </Button>
          <Button
            variant={view === "collections" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("collections")}
          >
            Collections
          </Button>
          <Button
            variant={view === "versions" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("versions")}
          >
            Versions
          </Button>
          <Button
            variant={view === "notes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("notes")}
          >
            Notes
          </Button>
        </div>
      </div>

      {/* Share View */}
      {view === "share" && (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Create a shareable link for this enhanced prompt. Anyone with the link can view it
              (no login required).
            </p>
            <Button onClick={handleCreateShare} className="w-full">
              🔗 Create Shareable Link
            </Button>
          </div>

          {sharedLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Your Shared Links</h4>
              <div className="space-y-2">
                {sharedLinks.slice(0, 5).map((link) => (
                  <Card key={link.linkId} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono truncate mb-1">
                          {generateShareableURL(link.shortCode)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {link.viewCount} views • Created {link.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => copyShareableURL(link.shortCode)}
                        >
                          📋
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-red-500"
                          onClick={() => {
                            deleteShareableLink(link.linkId);
                            setSharedLinks(loadShareableLinks());
                          }}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collections View */}
      {view === "collections" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Group related prompts into collections for easy management and sharing.
            </p>
            <Button size="sm" onClick={() => setShowNewCollection(!showNewCollection)}>
              + New
            </Button>
          </div>

          {showNewCollection && (
            <Card className="p-3 bg-muted/30">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md mb-2"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCollection} className="flex-1">
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNewCollection(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {collections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No collections yet. Create one to get started!
            </p>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => (
                <Card key={collection.collectionId} className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{collection.icon}</span>
                        <span className="font-semibold text-sm">{collection.collectionName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({collection.prompts.length} prompts)
                        </span>
                      </div>
                      {collection.description && (
                        <p className="text-xs text-muted-foreground">{collection.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {currentPrompt && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleAddToCollection(collection.collectionId)}
                      >
                        + Add Current
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleDownloadCollection(collection.collectionId, "json")}
                    >
                      📥 JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleDownloadCollection(collection.collectionId, "markdown")}
                    >
                      📄 MD
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-red-500"
                      onClick={() => handleDeleteCollection(collection.collectionId)}
                    >
                      🗑️
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Versions View */}
      {view === "versions" && currentPrompt && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Track changes and compare different versions of your prompts.
          </p>

          <div className="space-y-2">
            <Card className="p-3 bg-muted/30">
              <div className="text-sm font-semibold mb-2">Current Version</div>
              <div className="text-xs text-muted-foreground mb-2">
                Quality Score: {currentPrompt.qualityScore}/100
              </div>
              <div className="text-xs font-mono bg-background p-2 rounded max-h-24 overflow-y-auto">
                {currentPrompt.enhanced}
              </div>
            </Card>

            <Card className="p-3">
              <div className="text-sm font-semibold mb-2">Original Version</div>
              <div className="text-xs font-mono bg-muted/30 p-2 rounded max-h-24 overflow-y-auto">
                {currentPrompt.original}
              </div>
            </Card>

            <Card className="p-3 bg-accent/10">
              <div className="text-sm font-semibold mb-2">Changes Summary</div>
              <div className="space-y-1">
                {currentPrompt.improvements.map((improvement, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    • {improvement}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Notes View */}
      {view === "notes" && currentPrompt && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add notes and comments to document your thinking and iterate on prompts.
          </p>

          <div className="space-y-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md min-h-20"
            />
            <div className="flex gap-2">
              <div className="flex gap-1">
                {(["yellow", "blue", "green", "red", "purple"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      selectedColor === color ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color === "yellow" ? "#fef08a" : color }}
                  />
                ))}
              </div>
              <Button size="sm" onClick={handleCreateNote} className="ml-auto">
                Add Note
              </Button>
            </div>
          </div>

          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <Card
                  key={note.noteId}
                  className="p-3"
                  style={{
                    backgroundColor:
                      note.color === "yellow"
                        ? "#fef08a20"
                        : note.color === "blue"
                        ? "#3b82f620"
                        : note.color === "green"
                        ? "#22c55e20"
                        : note.color === "red"
                        ? "#ef444420"
                        : "#a855f720",
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm flex-1">{note.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500"
                      onClick={() => handleDeleteNote(note.noteId)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {note.createdAt.toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
