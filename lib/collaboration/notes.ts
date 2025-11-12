import { PromptNote, PromptComment } from "@/types";
import { generateId } from "@/lib/utils";

const NOTES_KEY = "hermes_prompt_notes";
const COMMENTS_KEY = "hermes_prompt_comments";

/**
 * Create a new note for a prompt
 */
export function createNote(
  promptId: string,
  content: string,
  color: "yellow" | "blue" | "green" | "red" | "purple" = "yellow",
  position?: { start: number; end: number }
): PromptNote {
  const note: PromptNote = {
    noteId: generateId(),
    promptId,
    content,
    color,
    position,
    createdAt: new Date(),
    lastModified: new Date(),
  };

  saveNote(note);
  return note;
}

/**
 * Save note to localStorage
 */
export function saveNote(note: PromptNote): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(NOTES_KEY);
    const notes: PromptNote[] = stored ? JSON.parse(stored) : [];

    notes.push({
      ...note,
      createdAt: note.createdAt.toISOString() as any,
      lastModified: note.lastModified.toISOString() as any,
    });

    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to save note:", error);
  }
}

/**
 * Load all notes for a prompt
 */
export function loadNotes(promptId: string): PromptNote[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(NOTES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed
      .filter((n: any) => n.promptId === promptId)
      .map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        lastModified: new Date(n.lastModified),
      }));
  } catch (error) {
    console.error("Failed to load notes:", error);
    return [];
  }
}

/**
 * Update a note
 */
export function updateNote(noteId: string, updates: Partial<PromptNote>): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(NOTES_KEY);
    if (!stored) return;

    const notes: PromptNote[] = JSON.parse(stored);
    const index = notes.findIndex((n: any) => n.noteId === noteId);

    if (index >= 0) {
      notes[index] = {
        ...notes[index],
        ...updates,
        lastModified: new Date().toISOString() as any,
      };

      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  } catch (error) {
    console.error("Failed to update note:", error);
  }
}

/**
 * Delete a note
 */
export function deleteNote(noteId: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(NOTES_KEY);
    if (!stored) return;

    const notes: PromptNote[] = JSON.parse(stored);
    const filtered = notes.filter((n: any) => n.noteId !== noteId);

    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete note:", error);
  }
}

/**
 * Create a new comment
 */
export function createComment(
  promptId: string,
  userId: string,
  userName: string,
  content: string
): PromptComment {
  const comment: PromptComment = {
    commentId: generateId(),
    promptId,
    userId,
    userName,
    content,
    createdAt: new Date(),
    isResolved: false,
    replies: [],
  };

  saveComment(comment);
  return comment;
}

/**
 * Save comment to localStorage
 */
export function saveComment(comment: PromptComment): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    const comments: PromptComment[] = stored ? JSON.parse(stored) : [];

    comments.push({
      ...comment,
      createdAt: comment.createdAt.toISOString() as any,
      editedAt: comment.editedAt?.toISOString() as any,
      replies: comment.replies.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString() as any,
        editedAt: r.editedAt?.toISOString() as any,
      })),
    });

    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  } catch (error) {
    console.error("Failed to save comment:", error);
  }
}

/**
 * Load all comments for a prompt
 */
export function loadComments(promptId: string): PromptComment[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed
      .filter((c: any) => c.promptId === promptId)
      .map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        editedAt: c.editedAt ? new Date(c.editedAt) : undefined,
        replies: c.replies.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          editedAt: r.editedAt ? new Date(r.editedAt) : undefined,
        })),
      }));
  } catch (error) {
    console.error("Failed to load comments:", error);
    return [];
  }
}

/**
 * Add reply to a comment
 */
export function addReply(
  commentId: string,
  userId: string,
  userName: string,
  content: string
): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    if (!stored) return;

    const comments: PromptComment[] = JSON.parse(stored);
    const comment = comments.find((c: any) => c.commentId === commentId);

    if (comment) {
      const reply: PromptComment = {
        commentId: generateId(),
        promptId: comment.promptId,
        userId,
        userName,
        content,
        createdAt: new Date() as any,
        isResolved: false,
        replies: [],
      };

      comment.replies.push(reply as any);

      localStorage.setItem(
        COMMENTS_KEY,
        JSON.stringify(
          comments.map((c) => ({
            ...c,
            createdAt: c.createdAt,
            editedAt: c.editedAt,
            replies: c.replies,
          }))
        )
      );
    }
  } catch (error) {
    console.error("Failed to add reply:", error);
  }
}

/**
 * Mark comment as resolved
 */
export function resolveComment(commentId: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    if (!stored) return;

    const comments: PromptComment[] = JSON.parse(stored);
    const comment = comments.find((c: any) => c.commentId === commentId);

    if (comment) {
      comment.isResolved = true;

      localStorage.setItem(
        COMMENTS_KEY,
        JSON.stringify(
          comments.map((c) => ({
            ...c,
            createdAt: c.createdAt,
            editedAt: c.editedAt,
            replies: c.replies,
          }))
        )
      );
    }
  } catch (error) {
    console.error("Failed to resolve comment:", error);
  }
}

/**
 * Delete a comment
 */
export function deleteComment(commentId: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    if (!stored) return;

    const comments: PromptComment[] = JSON.parse(stored);
    const filtered = comments.filter((c: any) => c.commentId !== commentId);

    localStorage.setItem(COMMENTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete comment:", error);
  }
}

/**
 * Get comment count for a prompt
 */
export function getCommentCount(promptId: string): number {
  const comments = loadComments(promptId);
  let count = comments.length;

  // Count replies
  comments.forEach((comment) => {
    count += comment.replies.length;
  });

  return count;
}

/**
 * Get unresolved comment count
 */
export function getUnresolvedCommentCount(promptId: string): number {
  const comments = loadComments(promptId);
  return comments.filter((c) => !c.isResolved).length;
}
