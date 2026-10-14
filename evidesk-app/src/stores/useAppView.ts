import { create } from "zustand";

type AppView =
  | { type: "inbox" }
  | { type: "sources" }
  | { type: "notes" }
  | { type: "excerpts" }
  | { type: "tasks" }
  | { type: "search" }
  | { type: "archived" }
  | { type: "topic"; topicId: string };

type AppViewStore = {
  currentView: AppView;
  activeViewLabel: string;
  goToInbox: () => void;
  goToSources: () => void;
  goToNotes: () => void;
  goToExcerpts: () => void;
  goToTasks: () => void;
  goToSearch: () => void;
  goToArchived: () => void;
  goToTopic: (topicId: string) => void;
};

export const useAppView = create<AppViewStore>((set) => ({
  currentView: { type: "inbox" },
  activeViewLabel: "Capture",

  goToInbox: () =>
    set({
      currentView: { type: "inbox" },
      activeViewLabel: "Capture",
    }),

  goToSources: () =>
    set({
      currentView: { type: "sources" },
      activeViewLabel: "Library",
    }),

  goToNotes: () =>
    set({
      currentView: { type: "notes" },
      activeViewLabel: "Markdown",
    }),

  goToExcerpts: () =>
    set({
      currentView: { type: "excerpts" },
      activeViewLabel: "Evidence",
    }),

  goToTasks: () =>
    set({
      currentView: { type: "tasks" },
      activeViewLabel: "Action",
    }),

  goToSearch: () =>
    set({
      currentView: { type: "search" },
      activeViewLabel: "Retrieve",
    }),

  goToArchived: () =>
    set({
      currentView: { type: "archived" },
      activeViewLabel: "Archive",
    }),

  goToTopic: (topicId: string) =>
    set({
      currentView: { type: "topic", topicId },
      activeViewLabel: "Dossier",
    }),
}));