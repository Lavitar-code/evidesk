import { useEffect, useMemo, useState } from "react";
import "./App.css";
import "./styles/pdf-import.css";
import { AppLayout } from "./app/AppLayout";
import { CommandPalette, type CommandPaletteItem } from "./components/CommandPalette";
import { ConfirmDangerModal } from "./components/ConfirmDangerModal";
import { SettingsModal } from "./components/SettingsModal";
import { ToastStack } from "./components/ToastStack";
import { useArchive } from "./features/archive/useArchive";
import { CreateExcerptModal } from "./features/excerpts/CreateExcerptModal";
import { ExcerptEditorPanel } from "./features/excerpts/ExcerptEditorPanel";
import { useExcerpts } from "./features/excerpts/useExcerpts";
import { CreateNoteModal } from "./features/notes/CreateNoteModal";
import { NoteEditorPanel } from "./features/notes/NoteEditorPanel";
import { useNotes } from "./features/notes/useNotes";
import { useSearch } from "./features/search/useSearch";
import { CreateUrlSourceModal } from "./features/sources/CreateUrlSourceModal";
import { ImportPdfModal } from "./features/sources/ImportPdfModal";
import { SourceDetailPanel } from "./features/sources/SourceDetailPanel";
import { useSourceTopicLinks } from "./features/sources/useSourceTopicLinks";
import { useSources } from "./features/sources/useSources";
import { CreateTaskModal } from "./features/tasks/CreateTaskModal";
import { TaskEditorPanel } from "./features/tasks/TaskEditorPanel";
import { useTasks } from "./features/tasks/useTasks";
import { usePreferences } from "./hooks/usePreferences";
import { useTopicDetail } from "./features/topics/useTopicDetail";
import { CreateTopicModal } from "./features/topics/CreateTopicModal";
import { useTopics } from "./features/topics/useTopics";
import { useToasts } from "./hooks/useToasts";
import { ArchivedPage } from "./pages/ArchivedPage";
import { ExcerptsPage } from "./pages/ExcerptsPage";
import { InboxPage } from "./pages/InboxPage";
import { NotesPage } from "./pages/NotesPage";
import { SearchPage } from "./pages/SearchPage";
import { SourcesPage } from "./pages/SourcesPage";
import { TasksPage } from "./pages/TasksPage";
import { TopicPage } from "./pages/TopicPage";
import { useAppView } from "./stores/useAppView";
import type { CreateExcerptInput, ExcerptDetail, UpdateExcerptInput } from "./types/excerpt";
import type { CreateNoteInput, NoteDetail, UpdateNoteInput } from "./types/note";
import type { SearchResultItem } from "./types/search";
import type { CreateUrlSourceInput, ImportPdfSourceInput } from "./types/source";
import type { CreateTaskInput, TaskDetail, UpdateTaskInput } from "./types/task";
import type { CreateTopicInput } from "./types/topic";

function App() {
  const {
    currentView,
    activeViewLabel,
    goToInbox,
    goToSources,
    goToNotes,
    goToExcerpts,
    goToSearch,
    goToTasks,
    goToArchived,
    goToTopic,
  } = useAppView();

  const {
    preferences,
    setCompactMode,
    setReducedMotion,
    setShowCommandHint,
    setAutoOpenDetailPanel,
    resetPreferences,
  } = usePreferences();

  const { toasts, dismissToast, pushSuccessToast, pushErrorToast, pushInfoToast } = useToasts();

  const { topics, isLoadingTopics, topicsError, createNewTopic, reloadTopics } = useTopics();
  const {
    sources,
    isLoadingSources,
    sourcesError,
    createNewUrlSource,
    importNewPdfSource,
    reloadSources,
    archiveExistingSource,
  } = useSources();
  const {
    notes,
    isLoadingNotes,
    notesError,
    createNewNote,
    fetchNoteDetail,
    updateExistingNote,
    archiveExistingNote,
    reloadNotes,
  } = useNotes();
  const {
    excerpts,
    isLoadingExcerpts,
    excerptsError,
    createNewExcerpt,
    fetchExcerptDetail,
    updateExistingExcerpt,
    archiveExistingExcerpt,
    reloadExcerpts,
  } = useExcerpts();
  const {
    tasks,
    isLoadingTasks,
    tasksError,
    createNewTask,
    fetchTaskDetail,
    updateExistingTask,
    archiveExistingTask,
    reloadTasks,
  } = useTasks();

  const {
    archivedSources,
    archivedNotes,
    archivedExcerpts,
    archivedTasks,
    isLoadingArchive,
    archiveError,
    reloadArchive,
    restoreArchivedSource,
    restoreArchivedNote,
    restoreArchivedExcerpt,
    restoreArchivedTask,
  } = useArchive();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const {
    detail: sourceTopicLinksDetail,
    isLoading: isLoadingSourceTopicLinks,
    error: sourceTopicLinksError,
    isMutating: isUpdatingSourceTopics,
    linkTopic,
    unlinkTopic,
  } = useSourceTopicLinks(selectedSourceId);

  const selectedTopic =
    currentView.type === "topic"
      ? topics.find((topic) => topic.id === currentView.topicId) ?? null
      : null;

  const { topicDetail, isLoadingTopicDetail, topicDetailError } = useTopicDetail(
    selectedTopic?.id ?? null,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const { results: searchResults, isLoadingSearch, searchError } = useSearch(searchQuery);

  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  const [isCreateSourceModalOpen, setIsCreateSourceModalOpen] = useState(false);
  const [isCreatingSource, setIsCreatingSource] = useState(false);
  const [sourceModalInitialTopicId, setSourceModalInitialTopicId] = useState<string | null>(null);

  const [isImportPdfModalOpen, setIsImportPdfModalOpen] = useState(false);
  const [isImportingPdf, setIsImportingPdf] = useState(false);
  const [pdfModalInitialTopicId, setPdfModalInitialTopicId] = useState<string | null>(null);

  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteModalInitialTopicId, setNoteModalInitialTopicId] = useState<string | null>(null);

  const [isCreateExcerptModalOpen, setIsCreateExcerptModalOpen] = useState(false);
  const [isCreatingExcerpt, setIsCreatingExcerpt] = useState(false);
  const [excerptModalInitialSourceId, setExcerptModalInitialSourceId] = useState<string | null>(null);

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskModalInitialTopicId, setTaskModalInitialTopicId] = useState<string | null>(null);

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNoteDetail, setSelectedNoteDetail] = useState<NoteDetail | null>(null);
  const [isLoadingSelectedNote, setIsLoadingSelectedNote] = useState(false);
  const [selectedNoteError, setSelectedNoteError] = useState<string | null>(null);
  const [isSavingSelectedNote, setIsSavingSelectedNote] = useState(false);

  const [selectedExcerptId, setSelectedExcerptId] = useState<string | null>(null);
  const [selectedExcerptDetail, setSelectedExcerptDetail] = useState<ExcerptDetail | null>(null);
  const [isLoadingSelectedExcerpt, setIsLoadingSelectedExcerpt] = useState(false);
  const [selectedExcerptError, setSelectedExcerptError] = useState<string | null>(null);
  const [isSavingSelectedExcerpt, setIsSavingSelectedExcerpt] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<TaskDetail | null>(null);
  const [isLoadingSelectedTask, setIsLoadingSelectedTask] = useState(false);
  const [selectedTaskError, setSelectedTaskError] = useState<string | null>(null);
  const [isSavingSelectedTask, setIsSavingSelectedTask] = useState(false);

  const [confirmArchiveKind, setConfirmArchiveKind] = useState<
    "source" | "note" | "excerpt" | "task" | null
  >(null);
  const [isArchivingEntity, setIsArchivingEntity] = useState(false);

  const inboxSources = useMemo(() => {
    return sources.filter((source) => source.topicCount === 0);
  }, [sources]);

  const topicSources = useMemo(() => {
    if (!selectedTopic) return [];
    return sources.filter((source) =>
      source.topicNames.split(",").map((v) => v.trim()).filter(Boolean).includes(selectedTopic.title),
    );
  }, [selectedTopic, sources]);

  const topicNotes = useMemo(() => {
    if (!selectedTopic) return [];
    return notes.filter((note) =>
      note.topicNames.split(",").map((v) => v.trim()).filter(Boolean).includes(selectedTopic.title),
    );
  }, [selectedTopic, notes]);

  const topicExcerpts = useMemo(() => {
    if (!selectedTopic) return [];
    return excerpts.filter((excerpt) =>
      excerpt.topicNames.split(",").map((v) => v.trim()).filter(Boolean).includes(selectedTopic.title),
    );
  }, [selectedTopic, excerpts]);

  const topicTasks = useMemo(() => {
    if (!selectedTopic) return [];
    return tasks.filter((task) =>
      task.topicNames.split(",").map((v) => v.trim()).filter(Boolean).includes(selectedTopic.title),
    );
  }, [selectedTopic, tasks]);

  const selectedSourceForCurrentView = useMemo(() => {
    if (!selectedSourceId) return null;

    if (currentView.type === "inbox") {
      return inboxSources.find((source) => source.id === selectedSourceId) ?? null;
    }

    if (currentView.type === "sources") {
      return sources.find((source) => source.id === selectedSourceId) ?? null;
    }

    if (currentView.type === "topic") {
      return topicSources.find((source) => source.id === selectedSourceId) ?? null;
    }

    return null;
  }, [currentView, inboxSources, selectedSourceId, sources, topicSources]);

  const commandPaletteItems = useMemo<CommandPaletteItem[]>(() => {
    const navigationItems: CommandPaletteItem[] = [
      {
        id: "nav-inbox",
        title: "Go to Inbox",
        subtitle: "Capture workspace",
        section: "Navigation",
        keywords: "inbox capture dashboard",
        onSelect: () => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToInbox();
        },
      },
      {
        id: "nav-sources",
        title: "Go to All Sources",
        subtitle: "Library",
        section: "Navigation",
        keywords: "sources library",
        onSelect: () => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToSources();
        },
      },
      {
        id: "nav-notes",
        title: "Go to Notes",
        subtitle: "Markdown notes",
        section: "Navigation",
        keywords: "notes markdown",
        onSelect: () => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToNotes();
        },
      },
      {
        id: "nav-excerpts",
        title: "Go to Excerpts",
        subtitle: "Evidence snippets",
        section: "Navigation",
        keywords: "excerpts evidence",
        onSelect: () => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToExcerpts();
        },
      },
      {
        id: "nav-tasks",
        title: "Go to Tasks",
        subtitle: "Action workspace",
        section: "Navigation",
        keywords: "tasks action",
        onSelect: () => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToTasks();
        },
      },
      {
        id: "nav-search",
        title: "Go to Search",
        subtitle: "Retrieve across workspace",
        section: "Navigation",
        keywords: "search retrieve",
        onSelect: () => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToSearch();
        },
      },
      {
        id: "nav-archived",
        title: "Go to Archived",
        subtitle: "Restore archived entities",
        section: "Navigation",
        keywords: "archived archive trash restore",
        onSelect: () => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToArchived();
        },
      },
    ];

    const actionItems: CommandPaletteItem[] = [
      {
        id: "action-topic",
        title: "Create new topic",
        subtitle: "Open topic modal",
        section: "Actions",
        keywords: "new create topic",
        onSelect: () => setIsCreateTopicModalOpen(true),
      },
      {
        id: "action-url",
        title: "Add URL source",
        subtitle: "Open URL capture modal",
        section: "Actions",
        keywords: "new add url source",
        onSelect: () => openCreateSourceModal(selectedTopic?.id),
      },
      {
        id: "action-pdf",
        title: "Import PDF",
        subtitle: "Open PDF import modal",
        section: "Actions",
        keywords: "import pdf",
        onSelect: () => openImportPdfModal(selectedTopic?.id),
      },
      {
        id: "action-note",
        title: "Create note",
        subtitle: "Open note modal",
        section: "Actions",
        keywords: "new create note",
        onSelect: () => openCreateNoteModal(selectedTopic?.id),
      },
      {
        id: "action-task",
        title: "Create task",
        subtitle: "Open task modal",
        section: "Actions",
        keywords: "new create task",
        onSelect: () => openCreateTaskModal(selectedTopic?.id),
      },
      {
        id: "action-excerpt",
        title: "Create excerpt",
        subtitle: "Open excerpt modal",
        section: "Actions",
        keywords: "new create excerpt",
        onSelect: () => openCreateExcerptModal(selectedSourceId ?? undefined),
      },
      {
        id: "action-settings",
        title: "Open settings",
        subtitle: "Workspace preferences",
        section: "Actions",
        keywords: "settings preferences",
        onSelect: () => setIsSettingsModalOpen(true),
      },
    ];

    const topicItems: CommandPaletteItem[] = topics.map((topic) => ({
      id: `topic-${topic.id}`,
      title: topic.title,
      subtitle: `${topic.realSourceCount} linked sources`,
      section: "Topics",
      keywords: `${topic.title} topic dossier`,
      onSelect: () => {
        setSelectedSourceId(null);
        setSelectedNoteId(null);
        setSelectedExcerptId(null);
        setSelectedTaskId(null);
        goToTopic(topic.id);
      },
    }));

    return [...navigationItems, ...actionItems, ...topicItems];
  }, [
    goToArchived,
    goToExcerpts,
    goToInbox,
    goToNotes,
    goToSearch,
    goToSources,
    goToTasks,
    goToTopic,
    selectedSourceId,
    selectedTopic?.id,
    topics,
  ]);

  useEffect(() => {
    function handleGlobalPaletteShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        const target = event.target as HTMLElement | null;
        const tagName = target?.tagName?.toLowerCase();

        if (tagName === "input" || tagName === "textarea" || target?.isContentEditable) {
          return;
        }

        event.preventDefault();
        setIsCommandPaletteOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleGlobalPaletteShortcut);
    return () => window.removeEventListener("keydown", handleGlobalPaletteShortcut);
  }, []);

  useEffect(() => {
    if (currentView.type !== "notes" || !selectedNoteId) {
      setSelectedNoteDetail(null);
      setSelectedNoteError(null);
      setIsLoadingSelectedNote(false);
      return;
    }

    let isMounted = true;

    async function loadSelectedNote() {
      try {
        setIsLoadingSelectedNote(true);
        setSelectedNoteError(null);
        const detail = await fetchNoteDetail(selectedNoteId);
        if (isMounted) setSelectedNoteDetail(detail);
      } catch (error) {
        if (isMounted) {
          setSelectedNoteDetail(null);
          setSelectedNoteError(String(error));
          setSelectedNoteId(null);
          void reloadNotes();
        }
      } finally {
        if (isMounted) setIsLoadingSelectedNote(false);
      }
    }

    void loadSelectedNote();

    return () => {
      isMounted = false;
    };
  }, [currentView.type, selectedNoteId, fetchNoteDetail, reloadNotes]);

  useEffect(() => {
    if (currentView.type !== "excerpts" && currentView.type !== "topic") {
      setSelectedExcerptDetail(null);
      setSelectedExcerptError(null);
      setIsLoadingSelectedExcerpt(false);
      return;
    }

    if (!selectedExcerptId) {
      setSelectedExcerptDetail(null);
      setSelectedExcerptError(null);
      setIsLoadingSelectedExcerpt(false);
      return;
    }

    let isMounted = true;

    async function loadSelectedExcerpt() {
      try {
        setIsLoadingSelectedExcerpt(true);
        setSelectedExcerptError(null);
        const detail = await fetchExcerptDetail(selectedExcerptId);
        if (isMounted) setSelectedExcerptDetail(detail);
      } catch (error) {
        if (isMounted) {
          setSelectedExcerptDetail(null);
          setSelectedExcerptError(String(error));
        }
      } finally {
        if (isMounted) setIsLoadingSelectedExcerpt(false);
      }
    }

    void loadSelectedExcerpt();

    return () => {
      isMounted = false;
    };
  }, [currentView.type, selectedExcerptId, fetchExcerptDetail]);

  useEffect(() => {
    if (currentView.type !== "tasks" && currentView.type !== "topic") {
      setSelectedTaskDetail(null);
      setSelectedTaskError(null);
      setIsLoadingSelectedTask(false);
      return;
    }

    if (!selectedTaskId) {
      setSelectedTaskDetail(null);
      setSelectedTaskError(null);
      setIsLoadingSelectedTask(false);
      return;
    }

    let isMounted = true;

    async function loadSelectedTask() {
      try {
        setIsLoadingSelectedTask(true);
        setSelectedTaskError(null);
        const detail = await fetchTaskDetail(selectedTaskId);
        if (isMounted) setSelectedTaskDetail(detail);
      } catch (error) {
        if (isMounted) {
          setSelectedTaskDetail(null);
          setSelectedTaskError(String(error));
        }
      } finally {
        if (isMounted) setIsLoadingSelectedTask(false);
      }
    }

    void loadSelectedTask();

    return () => {
      isMounted = false;
    };
  }, [currentView.type, selectedTaskId, fetchTaskDetail]);

  const rightPanel = useMemo(() => {
    if (currentView.type === "notes") {
      if (selectedNoteId && isLoadingSelectedNote) {
        return (
          <aside className="detail-sidebar">
            <div className="detail-section">
              <p className="detail-label">Note editor</p>
              <p className="detail-value">Loading note...</p>
            </div>
          </aside>
        );
      }

      if (selectedNoteId && selectedNoteError) {
        return (
          <aside className="detail-sidebar">
            <div className="detail-section">
              <p className="detail-label">Note editor</p>
              <p className="status-error">Could not load note</p>
              <p className="muted-text">{selectedNoteError}</p>
            </div>
          </aside>
        );
      }

      if (selectedNoteDetail) {
        return (
          <NoteEditorPanel
            isArchiving={isArchivingEntity && confirmArchiveKind === "note"}
            isSaving={isSavingSelectedNote}
            note={selectedNoteDetail}
            onArchive={() => {
              setConfirmArchiveKind("note");
              return Promise.resolve();
            }}
            onClose={() => {
              setSelectedNoteId(null);
              setSelectedNoteDetail(null);
              setSelectedNoteError(null);
            }}
            onSave={handleSaveSelectedNote}
          />
        );
      }
    }

    if (currentView.type === "excerpts" || currentView.type === "topic") {
      if (selectedExcerptId && isLoadingSelectedExcerpt) {
        return (
          <aside className="detail-sidebar">
            <div className="detail-section">
              <p className="detail-label">Excerpt editor</p>
              <p className="detail-value">Loading excerpt...</p>
            </div>
          </aside>
        );
      }

      if (selectedExcerptId && selectedExcerptError) {
        return (
          <aside className="detail-sidebar">
            <div className="detail-section">
              <p className="detail-label">Excerpt editor</p>
              <p className="status-error">Could not load excerpt</p>
              <p className="muted-text">{selectedExcerptError}</p>
            </div>
          </aside>
        );
      }

      if (selectedExcerptDetail) {
        return (
          <ExcerptEditorPanel
            excerpt={selectedExcerptDetail}
            isArchiving={isArchivingEntity && confirmArchiveKind === "excerpt"}
            isSaving={isSavingSelectedExcerpt}
            onArchive={() => {
              setConfirmArchiveKind("excerpt");
              return Promise.resolve();
            }}
            onClose={() => {
              setSelectedExcerptId(null);
              setSelectedExcerptDetail(null);
              setSelectedExcerptError(null);
            }}
            onSave={handleSaveSelectedExcerpt}
          />
        );
      }
    }

    if (currentView.type === "tasks" || currentView.type === "topic") {
      if (selectedTaskId && isLoadingSelectedTask) {
        return (
          <aside className="detail-sidebar">
            <div className="detail-section">
              <p className="detail-label">Task editor</p>
              <p className="detail-value">Loading task...</p>
            </div>
          </aside>
        );
      }

      if (selectedTaskId && selectedTaskError) {
        return (
          <aside className="detail-sidebar">
            <div className="detail-section">
              <p className="detail-label">Task editor</p>
              <p className="status-error">Could not load task</p>
              <p className="muted-text">{selectedTaskError}</p>
            </div>
          </aside>
        );
      }

      if (selectedTaskDetail) {
        return (
          <TaskEditorPanel
            isArchiving={isArchivingEntity && confirmArchiveKind === "task"}
            isSaving={isSavingSelectedTask}
            onArchive={() => {
              setConfirmArchiveKind("task");
              return Promise.resolve();
            }}
            onClose={() => {
              setSelectedTaskId(null);
              setSelectedTaskDetail(null);
              setSelectedTaskError(null);
            }}
            onSave={handleSaveSelectedTask}
            task={selectedTaskDetail}
          />
        );
      }
    }

    if (selectedSourceForCurrentView) {
      return (
        <SourceDetailPanel
          isArchiving={isArchivingEntity && confirmArchiveKind === "source"}
          isLoadingTopicLinks={isLoadingSourceTopicLinks}
          isUpdatingTopics={isUpdatingSourceTopics}
          linkedTopics={sourceTopicLinksDetail?.topics ?? []}
          onAddTopicLink={async (topicId) => {
            try {
              await linkTopic(topicId);
              await reloadSources();
              await reloadTopics();
              await reloadNotes();
              await reloadExcerpts();
              pushSuccessToast("Topic linked", "Source linked to topic.");
            } catch (error) {
              pushErrorToast("Could not link topic", String(error));
            }
          }}
          onArchive={() => {
            setConfirmArchiveKind("source");
            return Promise.resolve();
          }}
          onClose={() => setSelectedSourceId(null)}
          onCreateExcerpt={(sourceId) => openCreateExcerptModal(sourceId)}
          onRemoveTopicLink={async (topicId) => {
            try {
              await unlinkTopic(topicId);
              await reloadSources();
              await reloadTopics();
              await reloadNotes();
              await reloadExcerpts();
              pushInfoToast("Topic unlinked", "Source removed from topic.");
            } catch (error) {
              pushErrorToast("Could not unlink topic", String(error));
            }
          }}
          source={selectedSourceForCurrentView}
          topicLinksError={sourceTopicLinksError}
          topics={topics}
        />
      );
    }

    return null;
  }, [
    confirmArchiveKind,
    currentView.type,
    isArchivingEntity,
    isLoadingSelectedExcerpt,
    isLoadingSelectedNote,
    isLoadingSelectedTask,
    isLoadingSourceTopicLinks,
    isSavingSelectedExcerpt,
    isSavingSelectedNote,
    isSavingSelectedTask,
    isUpdatingSourceTopics,
    linkTopic,
    pushErrorToast,
    pushInfoToast,
    pushSuccessToast,
    reloadExcerpts,
    reloadNotes,
    reloadSources,
    reloadTopics,
    selectedExcerptDetail,
    selectedExcerptError,
    selectedExcerptId,
    selectedNoteDetail,
    selectedNoteError,
    selectedNoteId,
    selectedSourceForCurrentView,
    selectedTaskDetail,
    selectedTaskError,
    selectedTaskId,
    sourceTopicLinksDetail,
    sourceTopicLinksError,
    topics,
    unlinkTopic,
  ]);

  function openCreateSourceModal(topicId?: string) {
    setSourceModalInitialTopicId(topicId ?? null);
    setIsCreateSourceModalOpen(true);
  }

  function openImportPdfModal(topicId?: string) {
    setPdfModalInitialTopicId(topicId ?? null);
    setIsImportPdfModalOpen(true);
  }

  function openCreateNoteModal(topicId?: string) {
    setNoteModalInitialTopicId(topicId ?? null);
    setIsCreateNoteModalOpen(true);
  }

  function openCreateExcerptModal(sourceId?: string) {
    setExcerptModalInitialSourceId(sourceId ?? null);
    setIsCreateExcerptModalOpen(true);
  }

  function openCreateTaskModal(topicId?: string) {
    setTaskModalInitialTopicId(topicId ?? null);
    setIsCreateTaskModalOpen(true);
  }

  function handleSearchResultClick(result: SearchResultItem) {
    if (result.entityType === "topic") {
      setSelectedSourceId(null);
      setSelectedNoteId(null);
      setSelectedExcerptId(null);
      setSelectedTaskId(null);
      goToTopic(result.id);
      return;
    }

    if (result.entityType === "source") {
      setSelectedNoteId(null);
      setSelectedExcerptId(null);
      setSelectedTaskId(null);
      setSelectedSourceId(result.id);
      goToSources();
      return;
    }

    if (result.entityType === "note") {
      setSelectedSourceId(null);
      setSelectedExcerptId(null);
      setSelectedTaskId(null);
      setSelectedNoteId(result.id);
      goToNotes();
    }
  }

  const page = useMemo(() => {
    switch (currentView.type) {
      case "inbox":
        return (
          <InboxPage
            inboxSources={inboxSources}
            isLoadingSources={isLoadingSources}
            onAddSourceClick={() => openCreateSourceModal()}
            onImportPdfClick={() => openImportPdfModal()}
            onNewNoteClick={() => openCreateNoteModal()}
            onSourceSelect={(sourceId) => {
              setSelectedNoteId(null);
              setSelectedExcerptId(null);
              setSelectedTaskId(null);
              setSelectedSourceId(sourceId);
            }}
            selectedSourceId={selectedSourceId}
            sourcesError={sourcesError}
          />
        );

      case "sources":
        return (
          <SourcesPage
            isLoadingSources={isLoadingSources}
            onAddSourceClick={() => openCreateSourceModal()}
            onImportPdfClick={() => openImportPdfModal()}
            onSourceSelect={(sourceId) => {
              setSelectedNoteId(null);
              setSelectedExcerptId(null);
              setSelectedTaskId(null);
              setSelectedSourceId(sourceId);
            }}
            selectedSourceId={selectedSourceId}
            sources={sources}
            sourcesError={sourcesError}
            topics={topics}
          />
        );

      case "notes":
        return (
          <NotesPage
            isLoadingNotes={isLoadingNotes}
            notes={notes}
            notesError={notesError}
            onNewNoteClick={() => openCreateNoteModal()}
            onNoteSelect={(noteId) => {
              setSelectedSourceId(null);
              setSelectedExcerptId(null);
              setSelectedTaskId(null);
              setSelectedNoteId(noteId);
            }}
            selectedNoteId={selectedNoteId}
            topics={topics}
          />
        );

      case "excerpts":
        return (
          <ExcerptsPage
            excerpts={excerpts}
            excerptsError={excerptsError}
            isLoadingExcerpts={isLoadingExcerpts}
            onExcerptSelect={(excerptId) => {
              setSelectedSourceId(null);
              setSelectedNoteId(null);
              setSelectedTaskId(null);
              setSelectedExcerptId(excerptId);
            }}
            onNewExcerptClick={() => openCreateExcerptModal()}
            selectedExcerptId={selectedExcerptId}
            topics={topics}
          />
        );

      case "tasks":
        return (
          <TasksPage
            isLoadingTasks={isLoadingTasks}
            onNewTaskClick={() => openCreateTaskModal()}
            onTaskSelect={(taskId) => {
              setSelectedSourceId(null);
              setSelectedNoteId(null);
              setSelectedExcerptId(null);
              setSelectedTaskId(taskId);
            }}
            selectedTaskId={selectedTaskId}
            tasks={tasks}
            tasksError={tasksError}
            topics={topics}
          />
        );

      case "search":
        return (
          <SearchPage
            isLoadingSearch={isLoadingSearch}
            onResultClick={handleSearchResultClick}
            onSearchQueryChange={setSearchQuery}
            results={searchResults}
            searchError={searchError}
            searchQuery={searchQuery}
          />
        );

      case "archived":
        return (
          <ArchivedPage
            archivedExcerpts={archivedExcerpts}
            archivedNotes={archivedNotes}
            archivedSources={archivedSources}
            archivedTasks={archivedTasks}
            archiveError={archiveError}
            isLoadingArchive={isLoadingArchive}
            onRestoreExcerpt={async (excerptId) => {
              try {
                await restoreArchivedExcerpt(excerptId);
                await reloadExcerpts();
                await reloadSources();
                await reloadArchive();
                pushSuccessToast("Excerpt restored", "The excerpt is back in the active workspace.");
              } catch (error) {
                pushErrorToast("Restore failed", String(error));
              }
            }}
            onRestoreNote={async (noteId) => {
              try {
                await restoreArchivedNote(noteId);
                await reloadNotes();
                await reloadSources();
                await reloadArchive();
                pushSuccessToast("Note restored", "The note is back in the active workspace.");
              } catch (error) {
                pushErrorToast("Restore failed", String(error));
              }
            }}
            onRestoreSource={async (sourceId) => {
              try {
                await restoreArchivedSource(sourceId);
                await reloadSources();
                await reloadArchive();
                pushSuccessToast("Source restored", "The source is back in the active workspace.");
              } catch (error) {
                pushErrorToast("Restore failed", String(error));
              }
            }}
            onRestoreTask={async (taskId) => {
              try {
                await restoreArchivedTask(taskId);
                await reloadTasks();
                await reloadArchive();
                pushSuccessToast("Task restored", "The task is back in the active workspace.");
              } catch (error) {
                pushErrorToast("Restore failed", String(error));
              }
            }}
          />
        );

      case "topic":
        return selectedTopic ? (
          <TopicPage
            excerptsError={excerptsError}
            isLoadingExcerpts={isLoadingExcerpts}
            isLoadingNotes={isLoadingNotes}
            isLoadingSources={isLoadingSources}
            isLoadingTasks={isLoadingTasks}
            isLoadingTopicDetail={isLoadingTopicDetail}
            notesError={notesError}
            onAddSourceClick={() => openCreateSourceModal(selectedTopic.id)}
            onExcerptSelect={(excerptId) => {
              setSelectedSourceId(null);
              setSelectedNoteId(null);
              setSelectedTaskId(null);
              setSelectedExcerptId(excerptId);
            }}
            onImportPdfClick={() => openImportPdfModal(selectedTopic.id)}
            onNewExcerptClick={() => openCreateExcerptModal()}
            onNewNoteClick={() => openCreateNoteModal(selectedTopic.id)}
            onNewTaskClick={() => openCreateTaskModal(selectedTopic.id)}
            onNoteSelect={(noteId) => {
              setSelectedSourceId(null);
              setSelectedExcerptId(null);
              setSelectedTaskId(null);
              setSelectedNoteId(noteId);
              goToNotes();
            }}
            onSourceSelect={(sourceId) => {
              setSelectedNoteId(null);
              setSelectedExcerptId(null);
              setSelectedTaskId(null);
              setSelectedSourceId(sourceId);
            }}
            onTaskSelect={(taskId) => {
              setSelectedSourceId(null);
              setSelectedNoteId(null);
              setSelectedExcerptId(null);
              setSelectedTaskId(taskId);
            }}
            selectedExcerptId={selectedExcerptId}
            selectedNoteId={selectedNoteId}
            selectedSourceId={selectedSourceId}
            selectedTaskId={selectedTaskId}
            sourcesError={sourcesError}
            tasksError={tasksError}
            topic={selectedTopic}
            topicDetail={topicDetail}
            topicDetailError={topicDetailError}
            topicExcerpts={topicExcerpts}
            topicNotes={topicNotes}
            topicSources={topicSources}
            topicTasks={topicTasks}
          />
        ) : (
          <InboxPage
            inboxSources={inboxSources}
            isLoadingSources={isLoadingSources}
            onAddSourceClick={() => openCreateSourceModal()}
            onImportPdfClick={() => openImportPdfModal()}
            onNewNoteClick={() => openCreateNoteModal()}
            onSourceSelect={(sourceId) => {
              setSelectedNoteId(null);
              setSelectedExcerptId(null);
              setSelectedTaskId(null);
              setSelectedSourceId(sourceId);
            }}
            selectedSourceId={selectedSourceId}
            sourcesError={sourcesError}
          />
        );

      default:
        return (
          <InboxPage
            inboxSources={inboxSources}
            isLoadingSources={isLoadingSources}
            onAddSourceClick={() => openCreateSourceModal()}
            onImportPdfClick={() => openImportPdfModal()}
            onNewNoteClick={() => openCreateNoteModal()}
            onSourceSelect={(sourceId) => {
              setSelectedNoteId(null);
              setSelectedExcerptId(null);
              setSelectedTaskId(null);
              setSelectedSourceId(sourceId);
            }}
            selectedSourceId={selectedSourceId}
            sourcesError={sourcesError}
          />
        );
    }
  }, [
    archiveError,
    archivedExcerpts,
    archivedNotes,
    archivedSources,
    archivedTasks,
    currentView,
    excerpts,
    excerptsError,
    inboxSources,
    isLoadingArchive,
    isLoadingExcerpts,
    isLoadingNotes,
    isLoadingSearch,
    isLoadingSources,
    isLoadingTasks,
    isLoadingTopicDetail,
    notes,
    notesError,
    pushErrorToast,
    pushSuccessToast,
    reloadArchive,
    reloadExcerpts,
    reloadNotes,
    reloadSources,
    reloadTasks,
    restoreArchivedExcerpt,
    restoreArchivedNote,
    restoreArchivedSource,
    restoreArchivedTask,
    searchError,
    searchResults,
    selectedExcerptId,
    selectedNoteId,
    selectedSourceId,
    selectedTaskId,
    selectedTopic,
    sources,
    sourcesError,
    tasks,
    tasksError,
    topicDetail,
    topicDetailError,
    topicExcerpts,
    topicNotes,
    topicSources,
    topicTasks,
    topics,
  ]);

  async function handleCreateTopicSubmit(payload: CreateTopicInput) {
    try {
      setIsCreatingTopic(true);
      const createdTopic = await createNewTopic(payload);
      setIsCreateTopicModalOpen(false);
      goToTopic(createdTopic.id);
      pushSuccessToast("Topic created", createdTopic.title);
      return createdTopic;
    } catch (error) {
      pushErrorToast("Could not create topic", String(error));
      throw error;
    } finally {
      setIsCreatingTopic(false);
    }
  }

  async function handleCreateSourceSubmit(payload: CreateUrlSourceInput) {
    try {
      setIsCreatingSource(true);
      const createdSource = await createNewUrlSource(payload);
      await reloadTopics();

      setSelectedSourceId(createdSource.id);
      setSelectedNoteId(null);
      setSelectedExcerptId(null);
      setSelectedTaskId(null);
      setIsCreateSourceModalOpen(false);

      if (payload.topicId) {
        goToSources();
      } else {
        goToInbox();
      }

      pushSuccessToast("Source created", createdSource.title);
      return createdSource;
    } catch (error) {
      pushErrorToast("Could not create source", String(error));
      throw error;
    } finally {
      setIsCreatingSource(false);
    }
  }

  async function handleImportPdfSubmit(payload: ImportPdfSourceInput) {
    try {
      setIsImportingPdf(true);
      const createdSource = await importNewPdfSource(payload);
      await reloadTopics();

      setSelectedSourceId(createdSource.id);
      setSelectedNoteId(null);
      setSelectedExcerptId(null);
      setSelectedTaskId(null);
      setIsImportPdfModalOpen(false);

      if (payload.topicId) {
        goToSources();
      } else {
        goToInbox();
      }

      pushSuccessToast("PDF imported", createdSource.title);
      return createdSource;
    } catch (error) {
      pushErrorToast("Could not import PDF", String(error));
      throw error;
    } finally {
      setIsImportingPdf(false);
    }
  }

  async function handleCreateNoteSubmit(payload: CreateNoteInput) {
    try {
      setIsCreatingNote(true);
      const createdNote = await createNewNote(payload);
      await reloadTopics();
      await reloadSources();

      setSelectedSourceId(null);
      setSelectedExcerptId(null);
      setSelectedTaskId(null);
      setSelectedNoteId(createdNote.id);
      setIsCreateNoteModalOpen(false);
      goToNotes();

      pushSuccessToast("Note created", createdNote.title);
      return createdNote;
    } catch (error) {
      pushErrorToast("Could not create note", String(error));
      throw error;
    } finally {
      setIsCreatingNote(false);
    }
  }

  async function handleCreateExcerptSubmit(payload: CreateExcerptInput) {
    try {
      setIsCreatingExcerpt(true);
      const createdExcerpt = await createNewExcerpt(payload);

      setSelectedSourceId(null);
      setSelectedNoteId(null);
      setSelectedTaskId(null);
      setSelectedExcerptId(createdExcerpt.id);
      setIsCreateExcerptModalOpen(false);
      goToExcerpts();

      pushSuccessToast("Excerpt created", createdExcerpt.citationText);
      return createdExcerpt;
    } catch (error) {
      pushErrorToast("Could not create excerpt", String(error));
      throw error;
    } finally {
      setIsCreatingExcerpt(false);
    }
  }

  async function handleCreateTaskSubmit(payload: CreateTaskInput) {
    try {
      setIsCreatingTask(true);
      const createdTask = await createNewTask(payload);
      await reloadTopics();

      setSelectedSourceId(null);
      setSelectedNoteId(null);
      setSelectedExcerptId(null);
      setSelectedTaskId(createdTask.id);
      setIsCreateTaskModalOpen(false);
      goToTasks();

      pushSuccessToast("Task created", createdTask.title);
      return createdTask;
    } catch (error) {
      pushErrorToast("Could not create task", String(error));
      throw error;
    } finally {
      setIsCreatingTask(false);
    }
  }

  async function handleSaveSelectedNote(payload: UpdateNoteInput) {
    if (!selectedNoteId) return;

    try {
      setIsSavingSelectedNote(true);
      const updatedNote = await updateExistingNote(selectedNoteId, payload);
      await reloadSources();
      setSelectedNoteDetail(updatedNote);
      pushSuccessToast("Note saved");
    } catch (error) {
      pushErrorToast("Could not save note", String(error));
      throw error;
    } finally {
      setIsSavingSelectedNote(false);
    }
  }

  async function handleSaveSelectedTask(payload: UpdateTaskInput) {
    if (!selectedTaskId) return;

    try {
      setIsSavingSelectedTask(true);
      const updatedTask = await updateExistingTask(selectedTaskId, payload);
      setSelectedTaskDetail(updatedTask);
      pushSuccessToast("Task saved");
    } catch (error) {
      pushErrorToast("Could not save task", String(error));
      throw error;
    } finally {
      setIsSavingSelectedTask(false);
    }
  }

  async function handleSaveSelectedExcerpt(payload: UpdateExcerptInput) {
    if (!selectedExcerptId) return;

    try {
      setIsSavingSelectedExcerpt(true);
      const updatedExcerpt = await updateExistingExcerpt(selectedExcerptId, payload);
      setSelectedExcerptDetail(updatedExcerpt);
      pushSuccessToast("Excerpt saved");
    } catch (error) {
      pushErrorToast("Could not save excerpt", String(error));
      throw error;
    } finally {
      setIsSavingSelectedExcerpt(false);
    }
  }

  async function handleConfirmArchive() {
    try {
      setIsArchivingEntity(true);

      if (confirmArchiveKind === "source" && selectedSourceId) {
        await archiveExistingSource(selectedSourceId);
        await reloadSources();
        await reloadNotes();
        await reloadExcerpts();
        await reloadTopics();
        await reloadArchive();
        setSelectedSourceId(null);
        pushInfoToast("Source archived");
      }

      if (confirmArchiveKind === "note" && selectedNoteId) {
        await archiveExistingNote(selectedNoteId);
        await reloadNotes();
        await reloadSources();
        await reloadTopics();
        await reloadArchive();
        setSelectedNoteId(null);
        setSelectedNoteDetail(null);
        setSelectedNoteError(null);
        pushInfoToast("Note archived");
      }

      if (confirmArchiveKind === "excerpt" && selectedExcerptId) {
        await archiveExistingExcerpt(selectedExcerptId);
        await reloadExcerpts();
        await reloadSources();
        await reloadNotes();
        await reloadTopics();
        await reloadArchive();
        setSelectedExcerptId(null);
        setSelectedExcerptDetail(null);
        setSelectedExcerptError(null);
        pushInfoToast("Excerpt archived");
      }

      if (confirmArchiveKind === "task" && selectedTaskId) {
        await archiveExistingTask(selectedTaskId);
        await reloadTasks();
        await reloadTopics();
        await reloadArchive();
        setSelectedTaskId(null);
        setSelectedTaskDetail(null);
        setSelectedTaskError(null);
        pushInfoToast("Task archived");
      }

      setConfirmArchiveKind(null);
    } catch (error) {
      pushErrorToast("Archive failed", String(error));
    } finally {
      setIsArchivingEntity(false);
    }
  }

  function getArchiveModalCopy() {
    switch (confirmArchiveKind) {
      case "source":
        return {
          title: "Archive Source",
          message:
            "This source will be removed from the active workspace view, but kept in the database as archived.",
          confirmLabel: "Archive Source",
        };
      case "note":
        return {
          title: "Archive Note",
          message:
            "This note will disappear from active views, but its data will stay archived in the database.",
          confirmLabel: "Archive Note",
        };
      case "excerpt":
        return {
          title: "Archive Excerpt",
          message:
            "This excerpt will be removed from active views by archiving its underlying source context.",
          confirmLabel: "Archive Excerpt",
        };
      case "task":
        return {
          title: "Archive Task",
          message:
            "This task will disappear from active lists and topic dossiers, but remain archived in the database.",
          confirmLabel: "Archive Task",
        };
      default:
        return null;
    }
  }

  const archiveModalCopy = getArchiveModalCopy();

  return (
    <>
      <AppLayout
        activeTopicId={currentView.type === "topic" ? currentView.topicId : undefined}
        activeViewLabel={activeViewLabel}
        isLoadingTopics={isLoadingTopics}
        onArchivedClick={() => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToArchived();
        }}
        onCreateTopicClick={() => setIsCreateTopicModalOpen(true)}
        onExcerptsClick={() => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedTaskId(null);
          goToExcerpts();
        }}
        onInboxClick={() => {
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToInbox();
        }}
        onNotesClick={() => {
          setSelectedSourceId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToNotes();
        }}
        onOpenSettingsClick={() => setIsSettingsModalOpen(true)}
        onSearchClick={() => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToSearch();
        }}
        onSourcesClick={() => {
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToSources();
        }}
        onTasksClick={() => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToTasks();
        }}
        onTopicSelect={(topicId) => {
          setSelectedSourceId(null);
          setSelectedNoteId(null);
          setSelectedExcerptId(null);
          setSelectedTaskId(null);
          goToTopic(topicId);
        }}
        rightPanel={rightPanel}
        showCommandHint={preferences.showCommandHint}
        topics={topics}
        topicsError={topicsError}
      >
        {page}
      </AppLayout>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        items={commandPaletteItems}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <ToastStack onDismiss={dismissToast} toasts={toasts} />

      {isSettingsModalOpen ? (
        <SettingsModal
          onBackupError={(message) => pushErrorToast("Backup failed", message)}
          onBackupExported={(message) => pushSuccessToast("Backup exported", message)}
          onBackupImported={(message) => {
            pushSuccessToast("Backup imported", message);
            void reloadTopics();
            void reloadSources();
            void reloadNotes();
            void reloadExcerpts();
            void reloadTasks();
            void reloadArchive();
          }}
          onClose={() => setIsSettingsModalOpen(false)}
          onReset={resetPreferences}
          onToggleAutoOpenDetailPanel={setAutoOpenDetailPanel}
          onToggleCompactMode={setCompactMode}
          onToggleReducedMotion={setReducedMotion}
          onToggleShowCommandHint={setShowCommandHint}
          preferences={preferences}
        />
      ) : null}

      {isCreateTopicModalOpen ? (
        <CreateTopicModal
          isSubmitting={isCreatingTopic}
          onClose={() => {
            if (!isCreatingTopic) setIsCreateTopicModalOpen(false);
          }}
          onSubmit={handleCreateTopicSubmit}
        />
      ) : null}

      {isCreateSourceModalOpen ? (
        <CreateUrlSourceModal
          initialTopicId={sourceModalInitialTopicId}
          isSubmitting={isCreatingSource}
          onClose={() => {
            if (!isCreatingSource) setIsCreateSourceModalOpen(false);
          }}
          onSubmit={handleCreateSourceSubmit}
          topics={topics}
        />
      ) : null}

      {isImportPdfModalOpen ? (
        <ImportPdfModal
          initialTopicId={pdfModalInitialTopicId}
          isSubmitting={isImportingPdf}
          onClose={() => {
            if (!isImportingPdf) setIsImportPdfModalOpen(false);
          }}
          onSubmit={handleImportPdfSubmit}
          topics={topics}
        />
      ) : null}

      {isCreateNoteModalOpen ? (
        <CreateNoteModal
          initialTopicId={noteModalInitialTopicId}
          isSubmitting={isCreatingNote}
          onClose={() => {
            if (!isCreatingNote) setIsCreateNoteModalOpen(false);
          }}
          onSubmit={handleCreateNoteSubmit}
          topics={topics}
        />
      ) : null}

      {isCreateExcerptModalOpen ? (
        <CreateExcerptModal
          initialSourceId={excerptModalInitialSourceId}
          isSubmitting={isCreatingExcerpt}
          onClose={() => {
            if (!isCreatingExcerpt) setIsCreateExcerptModalOpen(false);
          }}
          onSubmit={handleCreateExcerptSubmit}
          sources={sources}
        />
      ) : null}

      {isCreateTaskModalOpen ? (
        <CreateTaskModal
          initialTopicId={taskModalInitialTopicId}
          isSubmitting={isCreatingTask}
          onClose={() => {
            if (!isCreatingTask) setIsCreateTaskModalOpen(false);
          }}
          onSubmit={handleCreateTaskSubmit}
          topics={topics}
        />
      ) : null}

      {confirmArchiveKind && archiveModalCopy ? (
        <ConfirmDangerModal
          confirmLabel={archiveModalCopy.confirmLabel}
          isSubmitting={isArchivingEntity}
          message={archiveModalCopy.message}
          onClose={() => {
            if (!isArchivingEntity) setConfirmArchiveKind(null);
          }}
          onConfirm={handleConfirmArchive}
          title={archiveModalCopy.title}
        />
      ) : null}
    </>
  );
}

export default App;