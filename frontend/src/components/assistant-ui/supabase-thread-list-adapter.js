import { supabase } from "@/supabaseClient";
import { createAssistantStream } from "assistant-stream";

/**
 * Implements the RemoteThreadListAdapter interface from @assistant-ui/react.
 *
 * Persists thread metadata + message state directly to Supabase using the
 * anon client (Row Level Security is enforced on the chat_threads table so
 * each user only touches their own rows).
 */
export class SupabaseThreadListAdapter {
  // -------------------------------------------------------------------------
  // list – return all active threads for the current user, newest first.
  // -------------------------------------------------------------------------
  async list() {
    const { data, error } = await supabase
      .from("chat_threads")
      .select("id, title, status")
      .eq("status", "regular")
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);

    return {
      threads: (data ?? []).map((row) => ({
        status: "regular",
        remoteId: row.id,
        title: row.title ?? undefined,
      })),
    };
  }

  // -------------------------------------------------------------------------
  // initialize – called when a new local thread is first used; persists it to
  // Supabase and hands back the stable remoteId (the Supabase UUID).
  // -------------------------------------------------------------------------
  async initialize(_threadId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    return { remoteId: data.id, externalId: undefined };
  }

  // -------------------------------------------------------------------------
  // fetch – retrieve metadata for a single thread (used on reload).
  // -------------------------------------------------------------------------
  async fetch(remoteId) {
    const { data, error } = await supabase
      .from("chat_threads")
      .select("id, title, status")
      .eq("id", remoteId)
      .single();

    if (error) throw new Error(error.message);

    return {
      status: data.status,
      remoteId: data.id,
      title: data.title ?? undefined,
    };
  }

  // -------------------------------------------------------------------------
  // rename – update the title column.
  // -------------------------------------------------------------------------
  async rename(remoteId, newTitle) {
    const { error } = await supabase
      .from("chat_threads")
      .update({ title: newTitle })
      .eq("id", remoteId);

    if (error) throw new Error(error.message);
  }

  // -------------------------------------------------------------------------
  // archive / unarchive – flip the status column.
  // -------------------------------------------------------------------------
  async archive(remoteId) {
    const { error } = await supabase
      .from("chat_threads")
      .update({ status: "archived" })
      .eq("id", remoteId);

    if (error) throw new Error(error.message);
  }

  async unarchive(remoteId) {
    const { error } = await supabase
      .from("chat_threads")
      .update({ status: "regular" })
      .eq("id", remoteId);

    if (error) throw new Error(error.message);
  }

  // -------------------------------------------------------------------------
  // delete – hard-delete the row.
  // -------------------------------------------------------------------------
  async delete(remoteId) {
    const { error } = await supabase
      .from("chat_threads")
      .delete()
      .eq("id", remoteId);

    if (error) throw new Error(error.message);
  }

  // -------------------------------------------------------------------------
  // generateTitle – derive a title from the first user message and persist it.
  // Returns an AssistantStream that emits the title text so the UI can update
  // optimistically.
  // -------------------------------------------------------------------------
  async generateTitle(remoteId, messages) {
    const firstUserMsg = messages.find((m) => m.role === "user");
    const textPart = firstUserMsg?.content?.find?.((p) => p.type === "text");
    const rawText =
      typeof firstUserMsg?.content === "string"
        ? firstUserMsg.content
        : textPart?.text ?? "";

    const title = rawText.trim().slice(0, 60) || "New Conversation";

    // Fire-and-forget update; don't block the stream on it.
    supabase
      .from("chat_threads")
      .update({ title })
      .eq("id", remoteId)
      .then(({ error }) => {
        if (error) console.warn("Failed to save thread title:", error.message);
      });

    return createAssistantStream((controller) => {
      controller.appendText(title);
    });
  }
}
