// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// import {
//   ArrowLeft,
//   Bug,
//   CalendarDays,
//   CheckCircle2,
//   CircleDot,
//   Clock3,
//   FileText,
//   Image as ImageIcon,
//   Layers3,
//   Paperclip,
//   Sparkles,
//   Target,
//   ExternalLink,
//   MoreHorizontal,
//   Trash2,
// } from "lucide-react";

// import CardDescriptionViewer from "@/components/card/CardDescriptionViewer";
// import CardCommits from "@/components/card/CardCommits";
// type CardPriority = "normal" | "show stopper" | "critical" | "major" | "minor";

// type TaskType = "bug" | "feature" | "task" | "tbd";

// type CardDetails = {
//   id: string;

//   cardNumber: number;

//   title: string;

//   description: string | null;

//   priority: CardPriority;

//   type: TaskType;

//   startDate: string | null;

//   dueDate: string | null;

//   completedAt: string | null;

//   sprintName: string | null;
//   sprintId: string[] | null;
//   estimateTime?: string | number | null;
//   spentTime?: string | number | null;

//   assignedTo?: string | null;

//   assigneeName?: string | null;

//   assignee?: string | null;

//   assignedToName?: string | null;
// };

// type CardAttachment = {
//   id: string;

//   cardId: string;

//   fileName: string;

//   fileUrl: string;

//   contentType: string | null;

//   size: number;

//   createdAt: string;
// };

// type CardDetailsResponse = { message: string; card: CardDetails };

// type AttachmentsResponse = { message: string; attachments: CardAttachment[] };

// type BoardMember = {
//   userId: string;
//   name: string;
//   email: string;
//   role: string;
// };
// type BoardMemberResponse = { message: string; data: BoardMember[] };
// type Sprint = { id: string; name: string; status: string };
// type SprintResponse = { message: string; sprints: Sprint[] };
// type EditableAction =
//   | { action: "description"; description: string }
//   | { action: "taskType"; type: TaskType }
//   | { action: "priority"; priority: CardPriority }
//   | { action: "estimateTime"; estimateTime: number | null }
//   | { action: "spentTime"; spentTime: number | null }
//   | { action: "sprint"; sprintId: string[] | null }
//   | { action: "assignedTo"; assignedTo: string | null };

// type CardDetailsPageProps = {
//   workspaceId: string;

//   boardId: string;

//   cardId: string;
// };

// const primary = { color: "var(--color-text-primary)" };

// const secondary = { color: "var(--color-text-secondary)" };

// const muted = { color: "var(--color-text-muted)" };

// const inputStyle = {
//   backgroundColor: "var(--color-input-bg)",
//   borderColor: "var(--color-border)",
//   color: "var(--color-text-primary)",
// };

// const surface = {
//   backgroundColor: "var(--color-card-bg)",

//   borderColor: "var(--color-border)",
// };

// export default function CardDetailsPage({
//   workspaceId,

//   boardId,

//   cardId,
// }: CardDetailsPageProps) {
//   const baseUrl = `/api/workspace/${workspaceId}/board/${boardId}/card/${cardId}`;

//   const boardUrl = `/dashboard/workspace/${workspaceId}/board/${boardId}`;
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [isCardMenuOpen, setIsCardMenuOpen] = useState(false);
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const cardMenuRef = useRef<HTMLDivElement>(null);
//   const [editingTime, setEditingTime] = useState<
//     "estimateTime" | "spentTime" | null
//   >(null);
//   const [editingField, setEditingField] = useState<
//     "type" | "priority" | "assignee" | "sprint" | null
//   >(null);
//   const [timeDraft, setTimeDraft] = useState("");
//   const cancelTimeBlurRef = useRef(false);
//   const [saveError, setSaveError] = useState<string | null>(null);
//   const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
//   const assigneeEditorEnabled = true;
//   const handleSaveTime = (
//     field: "estimateTime" | "spentTime",
//     value: string,
//   ) => {
//     const trimmedValue = value.trim();

//     // Empty input removes the time value.
//     if (trimmedValue === "") {
//       update({
//         action: field,
//         [field]: null,
//       } as EditableAction);
//       return;
//     }

//     const numericValue = Number(trimmedValue);

//     if (!Number.isFinite(numericValue) || numericValue < 0) {
//       setSaveError("Please enter a valid positive number.");
//       return;
//     }

//     update({
//       action: field,
//       [field]: numericValue,
//     } as EditableAction);
//   };

//   // Assignee POST action must be implemented in updateCardDetail before enabling the control.

//   const { data, isLoading, error } = useQuery<CardDetailsResponse>({
//     queryKey: ["board-card", workspaceId, boardId, cardId],

//     queryFn: async () => {
//       const response = await fetch(baseUrl);

//       const result = await response.json();

//       if (!response.ok)
//         throw new Error(result?.message ?? "Failed to load card.");

//       if (!result?.card) throw new Error("Card details were not returned.");

//       return result;
//     },

//     enabled: Boolean(workspaceId && boardId && cardId),
//   });

//   const {
//     data: attachmentData,

//     isLoading: attachmentsLoading,

//     isError: attachmentsError,
//   } = useQuery<AttachmentsResponse>({
//     queryKey: ["card-attachments", workspaceId, boardId, cardId, "card"],

//     queryFn: async () => {
//       const response = await fetch(`${baseUrl}/attachment?scope=card`);

//       const result = await response.json();

//       if (!response.ok)
//         throw new Error(result?.message ?? "Failed to load attachments.");

//       return {
//         ...result,

//         attachments: Array.isArray(result?.attachments)
//           ? result.attachments
//           : [],
//       };
//     },

//     enabled: Boolean(workspaceId && boardId && cardId),
//   });

//   const { data: boardMemberData } = useQuery<BoardMemberResponse>({
//     queryKey: ["board-members-all", workspaceId, boardId],
//     queryFn: async () => {
//       const response = await fetch(
//         `/api/workspace/${workspaceId}/board/${boardId}/boardMembers?all=true`,
//       );
//       const result = await response.json();
//       if (!response.ok)
//         throw new Error(result?.message ?? "Failed to fetch members");
//       return result;
//     },
//   });
//   const { data: sprintData } = useQuery<SprintResponse>({
//     queryKey: ["sprints", workspaceId, boardId],
//     queryFn: async () => {
//       const response = await fetch(
//         `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
//       );
//       const result = await response.json();
//       if (!response.ok)
//         throw new Error(result?.message ?? "Failed to fetch sprints");
//       return result;
//     },
//   });
//   const members = boardMemberData?.data ?? [];
//   const sprints = sprintData?.sprints ?? [];

//   const updateMutation = useMutation({
//     mutationFn: async (payload: EditableAction) => {
//       const response = await fetch(baseUrl, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const result = await response.json().catch(() => ({}));
//       if (!response.ok) throw new Error(result?.message ?? "Update failed");
//       return result;
//     },
//     onSuccess: async () => {
//       setSaveError(null);
//       setSaveSuccess("Saved");
//       setEditingTime(null);
//       await Promise.all([
//         queryClient.invalidateQueries({
//           queryKey: ["board-card", workspaceId, boardId, cardId],
//         }),
//         queryClient.invalidateQueries({
//           queryKey: ["board-cards", workspaceId, boardId],
//         }),
//       ]);
//     },
//     onError: (error) => {
//       setSaveSuccess(null);
//       setSaveError(
//         error instanceof Error ? error.message : "Unable to save changes",
//       );
//     },
//   });
//   const update = (payload: EditableAction) => {
//     setSaveError(null);
//     setSaveSuccess(null);
//     updateMutation.mutate(payload);
//   };

//   useEffect(() => {
//     if (!isCardMenuOpen) return;

//     const closeMenuOnOutsideClick = (event: MouseEvent) => {
//       if (!cardMenuRef.current?.contains(event.target as Node)) {
//         setIsCardMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", closeMenuOnOutsideClick);
//     return () =>
//       document.removeEventListener("mousedown", closeMenuOnOutsideClick);
//   }, [isCardMenuOpen]);

//   const deleteCardMutation = useMutation({
//     mutationFn: async () => {
//       const response = await fetch(baseUrl, { method: "DELETE" });
//       const result = await response.json().catch(() => null);

//       if (!response.ok) {
//         throw new Error(result?.message ?? "Failed to delete card.");
//       }

//       return result;
//     },
//     onSuccess: async () => {
//       setIsDeleteDialogOpen(false);
//       await queryClient.invalidateQueries({
//         queryKey: ["board-cards", workspaceId, boardId],
//       });
//       router.push(boardUrl);
//     },
//   });

//   const card = data?.card;

//   const attachments = attachmentData?.attachments ?? [];

//   return (
//     <main
//       className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
//       style={{ backgroundColor: "var(--color-column-bg)" }}
//     >
//       <div className="mx-auto w-full max-w-7xl">
//         <Link
//           href={boardUrl}
//           className="mb-5 inline-flex items-center gap-2 text-sm font-medium hover:opacity-70"
//           style={secondary}
//         >
//           <ArrowLeft size={16} /> Back to board
//         </Link>

//         {isLoading ? (
//           <div className="rounded-xl border p-8" style={surface}>
//             <div className="flex items-center gap-3 text-sm" style={secondary}>
//               <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" />
//               Loading card details...
//             </div>
//           </div>
//         ) : error ? (
//           <div
//             role="alert"
//             className="rounded-xl border p-6"
//             style={{
//               backgroundColor: "var(--color-tag-red-bg)",

//               borderColor: "var(--color-tag-red-text)",

//               color: "var(--color-tag-red-text)",
//             }}
//           >
//             <h2 className="font-semibold">Could not load this card</h2>

//             <p className="mt-2 text-sm">
//               {error instanceof Error ? error.message : "Something went wrong."}
//             </p>
//           </div>
//         ) : card ? (
//           <>
//             <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_285px] xl:gap-6">
//               {/* One uninterrupted content panel, like the YouTrack reference. */}

//               <article
//                 className="min-w-0 overflow-hidden rounded-xl border"
//                 style={surface}
//               >
//                 <div className="p-5 sm:p-7 lg:p-8">
//                   <div
//                     className="mb-4 flex flex-wrap items-center gap-2 text-xs"
//                     style={muted}
//                   >
//                     <span
//                       className="inline-flex items-center gap-1.5 font-semibold"
//                       style={secondary}
//                     >
//                       <Target size={14} /> CARD-{card.cardNumber}
//                     </span>

//                     {card.completedAt && (
//                       <span
//                         className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium"
//                         style={{
//                           backgroundColor: "var(--color-tag-green-bg)",

//                           color: "var(--color-tag-green-text)",
//                         }}
//                       >
//                         <CheckCircle2 size={13} /> Completed
//                       </span>
//                     )}
//                   </div>

//                   <h1
//                     className="break-words text-xl font-semibold leading-snug tracking-tight sm:text-2xl"
//                     style={primary}
//                   >
//                     {card.title}
//                   </h1>

//                   <section
//                     aria-labelledby="description-heading"
//                     className="mt-8"
//                   >
//                     <h2
//                       id="description-heading"
//                       className="mb-3 flex items-center gap-2 text-sm font-semibold"
//                       style={primary}
//                     >
//                       <FileText size={16} style={secondary} /> Description
//                     </h2>

//                     {card.description?.trim() ? (
//                       <div className="min-w-0 break-words" style={primary}>
//                         <CardDescriptionViewer
//                           content={card.description}
//                           className="text-sm leading-7"
//                           onContentChange={async (description) => {
//                             await updateMutation.mutateAsync({
//                               action: "description",
//                               description,
//                             });
//                           }}
//                           isSaving={updateMutation.isPending}
//                         />
//                       </div>
//                     ) : (
//                       <p
//                         className="rounded-lg border border-dashed px-4 py-6 text-sm"
//                         style={{ borderColor: "var(--color-border)", ...muted }}
//                       >
//                         No description has been added yet.
//                       </p>
//                     )}
//                   </section>

//                   <section
//                     aria-labelledby="attachments-heading"
//                     className="mt-8 border-t pt-6"
//                     style={{ borderColor: "var(--color-border)" }}
//                   >
//                     <div className="mb-4 flex items-center justify-between gap-3">
//                       <h2
//                         id="attachments-heading"
//                         className="flex items-center gap-2 text-sm font-semibold"
//                         style={primary}
//                       >
//                         <Paperclip size={16} style={secondary} /> Attachments
//                         {!attachmentsLoading && !attachmentsError && (
//                           <span className="text-xs font-normal" style={muted}>
//                             ({attachments.length})
//                           </span>
//                         )}
//                       </h2>
//                     </div>

//                     {attachmentsLoading ? (
//                       <p className="text-sm" style={secondary}>
//                         Loading attachments...
//                       </p>
//                     ) : attachmentsError ? (
//                       <p
//                         className="text-sm"
//                         style={{ color: "var(--color-tag-red-text)" }}
//                       >
//                         Attachments could not be loaded. Please try again.
//                       </p>
//                     ) : attachments.length === 0 ? (
//                       <div
//                         className="rounded-lg border border-dashed p-5 text-sm"
//                         style={{ borderColor: "var(--color-border)", ...muted }}
//                       >
//                         No attachments yet.
//                       </div>
//                     ) : (
//                       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                         {attachments.map((attachment) => {
//                           const isImage =
//                             attachment.contentType?.startsWith("image/") ||
//                             /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(
//                               attachment.fileName,
//                             );

//                           return (
//                             <a
//                               key={attachment.id}
//                               href={attachment.fileUrl}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               aria-label={`Open attachment ${attachment.fileName}`}
//                               className="group min-w-0 overflow-hidden rounded-lg border transition hover:shadow-sm"
//                               style={{
//                                 borderColor: "var(--color-border)",

//                                 backgroundColor: "var(--color-column-bg)",
//                               }}
//                             >
//                               <div
//                                 className="flex h-32 items-center justify-center overflow-hidden border-b"
//                                 style={{ borderColor: "var(--color-border)" }}
//                               >
//                                 {/* {isImage ? (
//                                 // Remote attachment URLs already come from your existing API.

//                                 // eslint-disable-next-line @next/next/no-img-element

//                                 <img
//                                   src={attachment.fileUrl}
//                                   alt={attachment.fileName}
//                                   loading="lazy"
//                                   className="h-full w-full object-contain"
//                                 />
//                               ) : (
//                                 <FileText size={30} style={secondary} />
//                               )} */}
//                                 {isImage ? (
//                                   <Image
//                                     src={attachment.fileUrl}
//                                     alt={attachment.fileName}
//                                     width={200}
//                                     height={128}
//                                     unoptimized
//                                     className="h-full w-full object-contain"
//                                   />
//                                 ) : (
//                                   <FileText size={30} style={secondary} />
//                                 )}
//                               </div>

//                               <div className="flex min-w-0 items-center gap-2 p-3">
//                                 {isImage ? (
//                                   <ImageIcon
//                                     size={16}
//                                     className="shrink-0"
//                                     style={secondary}
//                                   />
//                                 ) : (
//                                   <FileText
//                                     size={16}
//                                     className="shrink-0"
//                                     style={secondary}
//                                   />
//                                 )}

//                                 <div className="min-w-0 flex-1">
//                                   <p
//                                     className="truncate text-sm font-medium"
//                                     title={attachment.fileName}
//                                     style={primary}
//                                   >
//                                     {attachment.fileName}
//                                   </p>

//                                   <p className="mt-0.5 text-xs" style={muted}>
//                                     {formatFileSize(attachment.size)}
//                                   </p>
//                                 </div>

//                                 <ExternalLink
//                                   size={14}
//                                   className="shrink-0 opacity-60 group-hover:opacity-100"
//                                   style={secondary}
//                                 />
//                               </div>
//                             </a>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </section>

//                   {/* commit section  */}
//                   <CardCommits
//                     workspaceId={workspaceId}
//                     boardId={boardId}
//                     cardId={cardId}
//                   />
//                 </div>
//               </article>

//               {/* Inline editing: only the clicked property becomes a control. */}
//               <aside
//                 className="min-w-0 rounded-xl border p-5 lg:sticky lg:top-4"
//                 style={surface}
//                 aria-label="Card properties"
//               >
//                 <div className="mb-3 flex items-center justify-between gap-2">
//                   <h2 className="text-sm font-semibold" style={primary}>
//                     Details
//                   </h2>
//                   <div className="relative" ref={cardMenuRef}>
//                     <button
//                       type="button"
//                       aria-label="Card options"
//                       aria-haspopup="menu"
//                       aria-expanded={isCardMenuOpen}
//                       onClick={() => setIsCardMenuOpen((open) => !open)}
//                       className="rounded-md p-1.5 transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-1 dark:hover:bg-white/5"
//                       style={secondary}
//                     >
//                       <MoreHorizontal size={18} />
//                     </button>
//                     {isCardMenuOpen && (
//                       <div
//                         role="menu"
//                         aria-label="Card options"
//                         className="absolute right-0 top-full z-20 mt-1 min-w-40 rounded-lg border p-1 shadow-lg"
//                         style={{
//                           backgroundColor: "var(--color-card-bg)",
//                           borderColor: "var(--color-border)",
//                         }}
//                       >
//                         <button
//                           type="button"
//                           role="menuitem"
//                           onClick={() => {
//                             setIsCardMenuOpen(false);
//                             deleteCardMutation.reset();
//                             setIsDeleteDialogOpen(true);
//                           }}
//                           className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
//                           style={{ color: "var(--color-tag-red-text)" }}
//                         >
//                           <Trash2 size={15} />
//                           Delete Card
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {saveError && (
//                   <p
//                     role="alert"
//                     className="mb-3 text-xs"
//                     style={{ color: "var(--color-tag-red-text)" }}
//                   >
//                     {saveError}
//                   </p>
//                 )}
//                 {saveSuccess && (
//                   <p
//                     role="status"
//                     className="mb-3 text-xs"
//                     style={{ color: "var(--color-tag-green-text)" }}
//                   >
//                     {saveSuccess}
//                   </p>
//                 )}
//                 <dl className="space-y-3">
//                   <Property
//                     label="Type"
//                     icon={<TaskTypeIcon type={card.type} />}
//                   >
//                     {editingField === "type" ? (
//                       <select
//                         autoFocus
//                         aria-label="Change type"
//                         disabled={updateMutation.isPending}
//                         value={card.type}
//                         onBlur={() => setEditingField(null)}
//                         onChange={(e) =>
//                           update({
//                             action: "taskType",
//                             type: e.target.value as TaskType,
//                           })
//                         }
//                         className="w-full rounded-md border px-2 py-1.5 text-sm"
//                         style={inputStyle}
//                       >
//                         {(["task", "bug", "feature", "tbd"] as TaskType[]).map(
//                           (type) => (
//                             <option
//                               key={type}
//                               value={type}
//                               style={{
//                                 backgroundColor: "var(--color-card-bg)",
//                                 color: "var(--color-text-primary)",
//                               }}
//                             >
//                               {formatLabel(type)}
//                             </option>
//                           ),
//                         )}
//                       </select>
//                     ) : (
//                       <InlineValue
//                         onClick={() => setEditingField("type")}
//                         disabled={updateMutation.isPending}
//                       >
//                         {formatLabel(card.type)}
//                       </InlineValue>
//                     )}
//                   </Property>
//                   <Property label="Priority" icon={<CircleDot size={15} />}>
//                     {editingField === "priority" ? (
//                       <select
//                         autoFocus
//                         aria-label="Change priority"
//                         disabled={updateMutation.isPending}
//                         value={card.priority}
//                         onBlur={() => setEditingField(null)}
//                         onChange={(e) =>
//                           update({
//                             action: "priority",
//                             priority: e.target.value as CardPriority,
//                           })
//                         }
//                         className="w-full rounded-md border px-2 py-1.5 text-sm"
//                         style={inputStyle}
//                       >
//                         {(
//                           [
//                             "normal",
//                             "show stopper",
//                             "critical",
//                             "major",
//                             "minor",
//                           ] as CardPriority[]
//                         ).map((value) => (
//                           <option
//                             key={value}
//                             value={value}
//                             style={{
//                               backgroundColor: "var(--color-card-bg)",
//                               color: "var(--color-text-primary)",
//                             }}
//                           >
//                             {formatLabel(value)}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <InlineValue
//                         onClick={() => setEditingField("priority")}
//                         disabled={updateMutation.isPending}
//                       >
//                         {formatLabel(card.priority)}
//                       </InlineValue>
//                     )}
//                   </Property>
//                   <Property label="Assignee" icon={<Target size={15} />}>
//                     {editingField === "assignee" ? (
//                       <select
//                         autoFocus
//                         aria-label="Change assignee"
//                         disabled={
//                           !assigneeEditorEnabled || updateMutation.isPending
//                         }
//                         value={card.assignedTo ?? ""}
//                         onBlur={() => setEditingField(null)}
//                         onChange={(e) =>
//                           update({
//                             action: "assignedTo",
//                             assignedTo: e.target.value || null,
//                           })
//                         }
//                         className="w-full rounded-md border px-2 py-1.5 text-sm"
//                         style={inputStyle}
//                       >
//                         <option
//                           value=""
//                           style={{
//                             backgroundColor: "var(--color-card-bg)",
//                             color: "var(--color-text-primary)",
//                           }}
//                         >
//                           Unassigned
//                         </option>
//                         {card.assignedTo &&
//                           !members.some(
//                             (m) => m.userId === card.assignedTo,
//                           ) && (
//                             <option
//                               value={card.assignedTo}
//                               style={{
//                                 backgroundColor: "var(--color-card-bg)",
//                                 color: "var(--color-text-primary)",
//                               }}
//                             >
//                               {card.assigneeName ?? card.assignedTo}
//                             </option>
//                           )}
//                         {members.map((member) => (
//                           <option
//                             key={member.userId}
//                             value={member.userId}
//                             style={{
//                               backgroundColor: "var(--color-card-bg)",
//                               color: "var(--color-text-primary)",
//                             }}
//                           >
//                             {member.name}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <InlineValue
//                         onClick={() => setEditingField("assignee")}
//                         disabled={
//                           !assigneeEditorEnabled || updateMutation.isPending
//                         }
//                       >
//                         {members.find(
//                           (member) => member.userId === card.assignedTo,
//                         )?.name ??
//                           card.assigneeName ??
//                           card.assignedToName ??
//                           card.assignee ??
//                           card.assignedTo ??
//                           "Unassigned"}
//                       </InlineValue>
//                     )}
//                   </Property>

//                   {(["estimateTime", "spentTime"] as const).map((field) => (
//                     <Property
//                       key={field}
//                       label={
//                         field === "estimateTime" ? "Estimate" : "Time spent"
//                       }
//                       icon={<Clock3 size={15} />}
//                     >
//                       {editingTime === field ? (
//                         <input
//                           autoFocus
//                           type="number"
//                           min="0"
//                           step="any"
//                           aria-label={
//                             field === "estimateTime"
//                               ? "Estimated time"
//                               : "Spent time"
//                           }
//                           className="w-full min-w-0 rounded-md border px-2 py-1.5 text-sm"
//                           style={inputStyle}
//                           value={timeDraft}
//                           onChange={(e) => setTimeDraft(e.target.value)}
//                           placeholder="e.g. 120"
//                           disabled={updateMutation.isPending}
//                           onKeyDown={(e) => {
//                             if (e.key === "Escape") {
//                               cancelTimeBlurRef.current = true;
//                               setEditingTime(null);
//                             }

//                             if (e.key === "Enter") {
//                               e.preventDefault();
//                               e.currentTarget.blur();
//                             }
//                           }}
//                           onBlur={(e) => {
//                             if (cancelTimeBlurRef.current) {
//                               cancelTimeBlurRef.current = false;
//                               return;
//                             }

//                             if (updateMutation.isPending) return;

//                             // Automatically save as a number.
//                             handleSaveTime(field, e.currentTarget.value);
//                           }}
//                         />
//                       ) : (
//                         <InlineValue
//                           disabled={updateMutation.isPending}
//                           onClick={() => {
//                             setEditingField(null);
//                             cancelTimeBlurRef.current = false;
//                             setEditingTime(field);
//                             setTimeDraft(String(card[field] ?? ""));
//                           }}
//                         >
//                           {card[field] !== null &&
//                           card[field] !== undefined &&
//                           card[field] !== ""
//                             ? `${card[field]} ${Number(card[field]) === 1 ? "hour" : "hours"}`
//                             : "Not set"}
//                         </InlineValue>
//                       )}
//                     </Property>
//                   ))}
//                   <Property
//                     label="Start date"
//                     icon={<CalendarDays size={15} />}
//                   >
//                     {card.startDate ? formatCardDate(card.startDate) : "—"}
//                   </Property>
//                   <Property label="Due date" icon={<Clock3 size={15} />}>
//                     {card.dueDate ? formatCardDate(card.dueDate) : "—"}
//                   </Property>
//                   {card.completedAt && (
//                     <Property
//                       label="Completed"
//                       icon={<CheckCircle2 size={15} />}
//                     >
//                       {formatCardDate(card.completedAt)}
//                     </Property>
//                   )}
//                   <Property label="Sprint" icon={<Layers3 size={15} />}>
//                     {editingField === "sprint" ? (
//                       <select
//                         autoFocus
//                         aria-label="Change sprint"
//                         multiple
//                         disabled={updateMutation.isPending}
//                         value={card.sprintId ?? []}
//                         onBlur={() => setEditingField(null)}
//                         onChange={(e) => {
//                           const sprintIds = Array.from(
//                             e.target.selectedOptions,
//                             (option) => option.value,
//                           );

//                           update({
//                             action: "sprint",
//                             sprintId: sprintIds,
//                           });
//                         }}
//                         className="w-full rounded-md border px-2 py-1.5 text-sm"
//                         style={inputStyle}
//                       >
//                         {sprints.map((sprint) => (
//                           <option
//                             key={sprint.id}
//                             value={sprint.id}
//                             style={{
//                               backgroundColor: "var(--color-card-bg)",
//                               color: "var(--color-text-primary)",
//                             }}
//                           >
//                             {sprint.name}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <InlineValue
//                         onClick={() => setEditingField("sprint")}
//                         disabled={updateMutation.isPending}
//                       >
//                         {(card.sprintId ?? [])
//                           .map(
//                             (sprintId) =>
//                               sprints.find((sprint) => sprint.id === sprintId)
//                                 ?.name,
//                           )
//                           .filter((name): name is string => Boolean(name))
//                           .join(", ") ||
//                           card.sprintName ||
//                           "No sprint"}
//                       </InlineValue>
//                     )}
//                   </Property>
//                 </dl>
//               </aside>
//             </div>
//             {isDeleteDialogOpen && (
//               <div
//                 className="fixed inset-0 z-100 flex items-center justify-center p-4"
//                 role="dialog"
//                 aria-modal="true"
//                 aria-labelledby="delete-card-title"
//               >
//                 <button
//                   type="button"
//                   aria-label="Close delete confirmation"
//                   disabled={deleteCardMutation.isPending}
//                   onClick={() => setIsDeleteDialogOpen(false)}
//                   className="absolute inset-0 cursor-default bg-black/40 disabled:cursor-not-allowed"
//                 />
//                 <div
//                   className="relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl"
//                   style={{
//                     backgroundColor: "var(--color-card-bg)",
//                     borderColor: "var(--color-border)",
//                   }}
//                 >
//                   <div className="pr-8">
//                     <h2
//                       id="delete-card-title"
//                       className="text-lg font-semibold"
//                       style={primary}
//                     >
//                       Delete card?
//                     </h2>
//                     <p className="mt-2 text-sm leading-6" style={secondary}>
//                       Are you sure you want to delete this card
//                       <span className="font-semibold" style={primary}>
//                         {" "}
//                         &quot;{card.title}&quot;
//                       </span>
//                       ? This action cannot be undone.
//                     </p>
//                   </div>
//                   {deleteCardMutation.isError && (
//                     <p
//                       role="alert"
//                       className="mt-3 text-sm"
//                       style={{ color: "var(--color-tag-red-text)" }}
//                     >
//                       {deleteCardMutation.error instanceof Error
//                         ? deleteCardMutation.error.message
//                         : "Unable to delete this card."}
//                     </p>
//                   )}
//                   <div className="mt-6 flex justify-end gap-3">
//                     <button
//                       type="button"
//                       onClick={() => setIsDeleteDialogOpen(false)}
//                       disabled={deleteCardMutation.isPending}
//                       className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
//                       style={{
//                         borderColor: "var(--color-border)",
//                         color: "var(--color-text-primary)",
//                       }}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => deleteCardMutation.mutate()}
//                       disabled={deleteCardMutation.isPending}
//                       className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
//                       style={{ backgroundColor: "var(--color-tag-red-text)" }}
//                     >
//                       {deleteCardMutation.isPending
//                         ? "Deleting..."
//                         : "Delete Card"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         ) : null}
//       </div>
//     </main>
//   );
// }

// function InlineValue({
//   children,
//   onClick,
//   disabled = false,
// }: {
//   children: React.ReactNode;
//   onClick: () => void;
//   disabled?: boolean;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       title="Click to edit"
//       className="-mx-2 w-[calc(100%+1rem)] min-w-0 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-default dark:hover:bg-white/5"
//       style={primary}
//     >
//       <span className="break-words">{children}</span>
//     </button>
//   );
// }

// function Property({
//   label,

//   icon,

//   children,
// }: {
//   label: string;

//   icon: React.ReactNode;

//   children: React.ReactNode;
// }) {
//   return (
//     <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 text-sm">
//       <dt className="flex min-w-0 items-center gap-1 text-xs" style={muted}>
//         <span className="shrink-0">{icon}</span>

//         <span className="whitespace-nowrap">{label}</span>
//       </dt>

//       <dd className="min-w-0 font-medium" style={primary}>
//         {children}
//       </dd>
//     </div>
//   );
// }

// function TaskTypeIcon({ type }: { type?: TaskType | null }) {
//   switch (type) {
//     case "bug":
//       return <Bug size={14} />;

//     case "feature":
//       return <Sparkles size={14} />;

//     case "tbd":
//       return <Clock3 size={14} />;

//     default:
//       return <CheckCircle2 size={14} />;
//   }
// }

// function formatLabel(value?: string | null) {
//   if (!value) return "Task";

//   return value === "tbd"
//     ? "TBD"
//     : value.charAt(0).toUpperCase() + value.slice(1);
// }

// function formatCardDate(value: string) {
//   const date = new Date(value);

//   return Number.isNaN(date.getTime())
//     ? value
//     : date.toLocaleDateString("en-US", {
//         month: "short",

//         day: "numeric",

//         year: "numeric",
//       });
// }

// function formatFileSize(bytes: number) {
//   if (!Number.isFinite(bytes) || bytes < 0) return "File";

//   if (bytes < 1024) return `${bytes} B`;

//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode, RefObject } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ArrowLeft,
  Bug,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  FileText,
  Image as ImageIcon,
  KanbanSquare,
  Layers3,
  Paperclip,
  Sparkles,
  Target,
  ExternalLink,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import CardCommits from "@/components/card/CardCommits";
import CardDescriptionEditor from "@/components/card/CardDescriptionEditor";
import CardDescriptionViewer from "@/components/card/CardDescriptionViewer";
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { getPriorityColor } from "@/components/card/priority";

type CardPriority = "normal" | "show stopper" | "critical" | "major" | "minor";

type TaskType = "bug" | "feature" | "task" | "tbd";

type CardDetails = {
  id: string;
  cardNumber: number;
  title: string;
  description: string | null;
  priority: CardPriority;
  type: TaskType;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  sprintName: string | null;
  sprintId: string[] | null;
  boardListId?: string;
  estimateTime?: string | number | null;
  spentTime?: string | number | null;
  assignedTo?: string | null;
  assigneeName?: string | null;
  assignee?: string | null;
  assignedToName?: string | null;
};

type CardAttachment = {
  id: string;
  cardId: string;
  fileName: string;
  fileUrl: string;
  contentType: string | null;
  size: number;
  createdAt: string;
};

type CardDetailsResponse = {
  message: string;
  card: CardDetails;
};

type AttachmentsResponse = {
  message: string;
  attachments: CardAttachment[];
};

type BoardMember = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

type BoardMemberResponse = {
  message: string;
  data: BoardMember[];
};

type Sprint = {
  id: string;
  name: string;
  status: string;
};

type SprintResponse = {
  message: string;
  sprints: Sprint[];
};
type BoardListItem = {
  id: string;
  listName: string;
  position: number;
};

type EditableAction =
  | { action: "title"; title: string }
  | { action: "description"; description: string }
  | { action: "startDate"; startDate: string | null }
  | { action: "dueDate"; dueDate: string | null }
  | { action: "taskType"; type: TaskType }
  | { action: "priority"; priority: CardPriority }
  | { action: "estimateTime"; estimateTime: number | null }
  | { action: "spentTime"; spentTime: number | null }
  | { action: "sprint"; sprintId: string[] | null }
  | { action: "assignedTo"; assignedTo: string | null };

type CardDetailsPageProps = {
  workspaceId: string;
  boardId: string;
  cardId: string;
};

const primary = {
  color: "var(--color-text-primary)",
};

const secondary = {
  color: "var(--color-text-secondary)",
};

const muted = {
  color: "var(--color-text-muted)",
};

const inputStyle = {
  backgroundColor: "var(--color-input-bg)",
  borderColor: "var(--color-border)",
  color: "var(--color-text-primary)",
};

const surface = {
  backgroundColor: "var(--color-card-bg)",
  borderColor: "var(--color-border)",
};

export default function CardDetailsPage({
  workspaceId,
  boardId,
  cardId,
}: CardDetailsPageProps) {
  const baseUrl = `/api/workspace/${workspaceId}/board/${boardId}/card/${cardId}`;

  const boardUrl = `/dashboard/workspace/${workspaceId}/board/${boardId}`;

  const router = useRouter();
  const queryClient = useQueryClient();

  const [isCardMenuOpen, setIsCardMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const cardMenuRef = useRef<HTMLDivElement>(null);
  const cancelTimeBlurRef = useRef(false);

  const [editingTime, setEditingTime] = useState<
    "estimateTime" | "spentTime" | null
  >(null);

  const [editingField, setEditingField] = useState<"sprint" | null>(null);
  const [sprintPlacement, setSprintPlacement] = useState<Placement>("below");

  const [editingCardField, setEditingCardField] = useState<
    "title" | "description" | null
  >(null);

  const [cardFieldDraft, setCardFieldDraft] = useState("");
  const [timeDraft, setTimeDraft] = useState("");

  const { showToast } = useToast();

  // Set when an inline editor closes, so its blur does not save twice.
  const skipBlurSaveRef = useRef(false);
  const descriptionEditorRef = useRef<HTMLDivElement>(null);

  // Per field: the newest request, how many are in flight, and the last
  // value the server confirmed. Used so an older failed request never
  // overwrites a newer change.
  const fieldRequestsRef = useRef<
    Record<
      string,
      { latest: number; pending: number; confirmed: Partial<CardDetails> }
    >
  >({});

  const { data, isLoading, error } = useQuery<CardDetailsResponse>({
    queryKey: ["board-card", workspaceId, boardId, cardId],
    queryFn: async () => {
      const response = await fetch(baseUrl);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to load card.");
      }

      if (!result?.card) {
        throw new Error("Card details were not returned.");
      }

      return result;
    },
    enabled: Boolean(workspaceId && boardId && cardId),
  });

  const {
    data: attachmentData,
    isLoading: attachmentsLoading,
    isError: attachmentsError,
  } = useQuery<AttachmentsResponse>({
    queryKey: ["card-attachments", workspaceId, boardId, cardId, "card"],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/attachment?scope=card`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to load attachments.");
      }

      return {
        ...result,
        attachments: Array.isArray(result?.attachments)
          ? result.attachments
          : [],
      };
    },
    enabled: Boolean(workspaceId && boardId && cardId),
  });

  const { data: boardMemberData } = useQuery<BoardMemberResponse>({
    queryKey: ["board-members-all", workspaceId, boardId],
    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/boardMembers?all=true`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to fetch members.");
      }

      return result;
    },
  });

  const { data: boardLists = [] } = useQuery<BoardListItem[]>({
    queryKey: ["board-lists", workspaceId, boardId],
    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/boardList`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to fetch board lists.");
      }

      return result.boardLists ?? result.lists ?? [];
    },
    enabled: Boolean(workspaceId && boardId),
  });

  const { data: sprintData } = useQuery<SprintResponse>({
    queryKey: ["sprints", workspaceId, boardId],
    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to fetch sprints.");
      }

      return result;
    },
  });

  const members = boardMemberData?.data ?? [];
  const sprints = sprintData?.sprints ?? [];
  const attachments = attachmentData?.attachments ?? [];

  const cardQueryKey = ["board-card", workspaceId, boardId, cardId];
  const updateMutationKey = ["card-update", cardId];

  // The value each update should show right away, in the card cache's shape.
  const getOptimisticPatch = (payload: EditableAction): Partial<CardDetails> => {
    switch (payload.action) {
      case "title":
        return { title: payload.title };
      case "description":
        return { description: payload.description };
      case "startDate":
        return {
          startDate: payload.startDate
            ? new Date(payload.startDate).toISOString()
            : null,
        };
      case "dueDate":
        return {
          dueDate: payload.dueDate
            ? new Date(payload.dueDate).toISOString()
            : null,
        };
      case "taskType":
        return { type: payload.type };
      case "priority":
        return { priority: payload.priority };
      case "estimateTime":
        return { estimateTime: payload.estimateTime };
      case "spentTime":
        return { spentTime: payload.spentTime };
      case "sprint": {
        const sprintIds = payload.sprintId ?? [];
        const names = sprintIds
          .map((id) => sprints.find((sprint) => sprint.id === id)?.name)
          .filter((name): name is string => Boolean(name));
        return { sprintId: sprintIds, sprintName: names.join(", ") || null };
      }
      case "assignedTo": {
        const name =
          members.find((member) => member.userId === payload.assignedTo)
            ?.name ?? null;
        return {
          assignedTo: payload.assignedTo,
          assigneeName: name,
          assignedToName: name,
          assignee: name,
        };
      }
    }
  };

  const setCardInCache = (patch: Partial<CardDetails>) => {
    queryClient.setQueryData<CardDetailsResponse>(cardQueryKey, (old) =>
      old ? { ...old, card: { ...old.card, ...patch } } : old,
    );
  };

  const updateMutation = useMutation({
    mutationKey: updateMutationKey,

    mutationFn: async (payload: EditableAction) => {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message ?? "Update failed.");
      }

      return result;
    },

    // Show the new value immediately.
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: cardQueryKey });

      const patch = getOptimisticPatch(payload);
      const field = payload.action;
      const entry = (fieldRequestsRef.current[field] ??= {
        latest: 0,
        pending: 0,
        confirmed: {},
      });

      // With nothing in flight for this field, the cache holds the server
      // value: remember it as the value to restore on failure.
      const currentCard =
        queryClient.getQueryData<CardDetailsResponse>(cardQueryKey)?.card;
      if (entry.pending === 0 && currentCard) {
        entry.confirmed = Object.fromEntries(
          Object.keys(patch).map((key) => [
            key,
            currentCard[key as keyof CardDetails] ?? null,
          ]),
        );
      }

      entry.latest += 1;
      entry.pending += 1;
      setCardInCache(patch);

      return { field, requestId: entry.latest, patch };
    },

    onSuccess: (_result, _payload, context) => {
      const entry = fieldRequestsRef.current[context.field];
      if (entry) entry.confirmed = context.patch;
    },

    // Restore the last confirmed value, unless a newer change to the same
    // field has been made since this request started.
    onError: (mutationError, _payload, context) => {
      const entry = context && fieldRequestsRef.current[context.field];
      if (entry && entry.latest === context.requestId) {
        setCardInCache(entry.confirmed);
      }

      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save changes.",
        "error",
      );
    },

    onSettled: async (_result, _error, _payload, context) => {
      const entry = context && fieldRequestsRef.current[context.field];
      if (entry) entry.pending -= 1;

      // Refetch only when no other card update is in flight, so a refetch
      // cannot overwrite another field's pending change.
      if (queryClient.isMutating({ mutationKey: updateMutationKey }) === 1) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cardQueryKey }),
          queryClient.invalidateQueries({
            queryKey: ["board-cards", workspaceId, boardId],
          }),
        ]);
      }
    },
  });

  const update = (payload: EditableAction) => updateMutation.mutate(payload);

  const startCardFieldEdit = (
    field: "title" | "description",
    value: string,
  ) => {
    skipBlurSaveRef.current = false;
    setCardFieldDraft(value);
    setEditingCardField(field);
  };

  const closeCardFieldEditor = () => {
    skipBlurSaveRef.current = true;
    setEditingCardField(null);
  };

  // Saves the open title/description editor; unchanged values send no
  // request.
  const saveCardField = () => {
    const currentCard = data?.card;
    if (!editingCardField || !currentCard) return;

    const field = editingCardField;
    const value =
      field === "description" ? cardFieldDraft : cardFieldDraft.trim();

    if (field === "title" && !value) {
      showToast("Title cannot be empty.", "error");
      return;
    }

    closeCardFieldEditor();

    if (field === "title") {
      if (value !== currentCard.title) update({ action: "title", title: value });
      return;
    }

    if (value !== (currentCard.description ?? "")) {
      update({ action: "description", description: value });
    }
  };

  // Description: save when focus really leaves the editor. Checked on the
  // next tick, so the editor's own toolbar, its link prompt, or switching
  // browser tabs does not save and close it.
  const handleDescriptionBlur = () => {
    setTimeout(() => {
      if (skipBlurSaveRef.current || !document.hasFocus()) return;
      if (descriptionEditorRef.current?.contains(document.activeElement)) {
        return;
      }
      saveCardField();
    }, 0);
  };

  const handleSaveTime = (
    field: "estimateTime" | "spentTime",
    value: string,
  ) => {
    const trimmedValue = value.trim();
    const numericValue = trimmedValue ? Number(trimmedValue) : null;

    if (
      numericValue !== null &&
      (!Number.isFinite(numericValue) || numericValue < 0)
    ) {
      showToast("Please enter a valid non-negative number.", "error");
      return;
    }

    setEditingTime(null);

    const currentValue = data?.card?.[field];
    const previous =
      currentValue === null || currentValue === undefined || currentValue === ""
        ? null
        : Number(currentValue);
    if (previous === numericValue) return;

    update({
      action: field,
      [field]: numericValue,
    } as EditableAction);
  };

  useEffect(() => {
    if (!isCardMenuOpen) return;

    const closeMenuOnOutsideClick = (event: MouseEvent) => {
      if (!cardMenuRef.current?.contains(event.target as Node)) {
        setIsCardMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenuOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeMenuOnOutsideClick);
    };
  }, [isCardMenuOpen]);

  const deleteCardMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(baseUrl, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to delete card.");
      }

      return result;
    },

    onSuccess: async () => {
      setIsDeleteDialogOpen(false);

      await queryClient.invalidateQueries({
        queryKey: ["board-cards", workspaceId, boardId],
      });

      router.push(boardUrl);
    },
  });

  const card = data?.card;

  // Status is the card's list; the last list holds completed cards (same
  // rule as the dashboard).
  const sortedLists = [...boardLists].sort((a, b) => a.position - b.position);
  const cardList = sortedLists.find((list) => list.id === card?.boardListId);
  const isInLastList =
    Boolean(cardList) && sortedLists.at(-1)?.id === cardList?.id;

  return (
    <main
      // Native controls (e.g. the time fields' spin buttons) follow the theme.
      className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 dark:[color-scheme:dark]"
      style={{ backgroundColor: "var(--color-column-bg)" }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href={boardUrl}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium hover:opacity-70"
          style={secondary}
        >
          <ArrowLeft size={16} />
          Back to board
        </Link>

        {isLoading ? (
          <div className="rounded-xl border p-8" style={surface}>
            <div className="flex items-center gap-3 text-sm" style={secondary}>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" />
              Loading card details...
            </div>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border p-6"
            style={{
              backgroundColor: "var(--color-tag-red-bg)",
              borderColor: "var(--color-tag-red-text)",
              color: "var(--color-tag-red-text)",
            }}
          >
            <h2 className="font-semibold">Could not load this card</h2>
            <p className="mt-2 text-sm">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
          </div>
        ) : card ? (
          <>
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_285px] xl:gap-6">
              <article
                className="min-w-0 overflow-hidden rounded-xl border lg:col-start-1 lg:row-start-1"
                style={surface}
              >
                <div className="p-5 sm:p-7 lg:p-8">
                  <div
                    className="mb-4 flex flex-wrap items-center gap-2 text-xs"
                    style={muted}
                  >
                    <span
                      className="inline-flex items-center gap-1.5 font-semibold"
                      style={secondary}
                    >
                      <Target size={14} />
                      CARD-{card.cardNumber}
                    </span>

                    {card.completedAt && (
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium"
                        style={{
                          backgroundColor: "var(--color-tag-green-bg)",
                          color: "var(--color-tag-green-text)",
                        }}
                      >
                        <CheckCircle2 size={13} />
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Title: click to edit; saves on blur or Enter, Esc cancels */}
                  {editingCardField === "title" ? (
                    <input
                      autoFocus
                      aria-label="Card title"
                      value={cardFieldDraft}
                      maxLength={255}
                      onChange={(event) => setCardFieldDraft(event.target.value)}
                      onBlur={() => {
                        if (!skipBlurSaveRef.current) saveCardField();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                        if (event.key === "Escape") closeCardFieldEditor();
                      }}
                      className="-mx-2 w-[calc(100%+1rem)] rounded-md border px-2 py-1 text-xl font-semibold leading-snug tracking-tight outline-none focus:border-[var(--color-primary)] sm:text-2xl"
                      style={inputStyle}
                    />
                  ) : (
                    <h1
                      role="button"
                      tabIndex={0}
                      title="Click to edit"
                      onClick={() => startCardFieldEdit("title", card.title)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          startCardFieldEdit("title", card.title);
                        }
                      }}
                      className="-mx-2 cursor-text break-words rounded-md border border-transparent px-2 py-1 text-xl font-semibold leading-snug tracking-tight transition-colors hover:bg-[var(--color-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] sm:text-2xl"
                      style={primary}
                    >
                      {card.title}
                    </h1>
                  )}

                  {/* Description */}
                  <section
                    aria-labelledby="description-heading"
                    className="mt-8"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h2
                        id="description-heading"
                        className="flex items-center gap-2 text-sm font-semibold"
                        style={primary}
                      >
                        <FileText size={16} style={secondary} />
                        Description
                      </h2>
                    </div>

                    {editingCardField === "description" ? (
                      // Saves when focus leaves the editor or on Ctrl/Cmd+Enter;
                      // Esc cancels.
                      <div
                        ref={descriptionEditorRef}
                        className="mt-3 space-y-1.5"
                        onBlur={handleDescriptionBlur}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            event.preventDefault();
                            closeCardFieldEditor();
                          }
                          if (
                            event.key === "Enter" &&
                            (event.ctrlKey || event.metaKey)
                          ) {
                            event.preventDefault();
                            saveCardField();
                          }
                        }}
                      >
                        {/* Same Markdown editor as the Create Card form. */}
                        <CardDescriptionEditor
                          value={cardFieldDraft}
                          onChange={setCardFieldDraft}
                        />
                        <p className="text-xs" style={muted}>
                          Saves when you click outside · Ctrl+Enter to save ·
                          Esc to cancel
                        </p>
                      </div>
                    ) : card.description?.trim() ? (
                      // Click the text to edit. Links and checklist
                      // checkboxes keep working.
                      <div
                        tabIndex={0}
                        title="Click to edit"
                        aria-label="Edit description"
                        onClick={(event) => {
                          if (
                            (event.target as HTMLElement).closest(
                              "a, input, button, label",
                            )
                          ) {
                            return;
                          }
                          startCardFieldEdit(
                            "description",
                            card.description ?? "",
                          );
                        }}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            event.target === event.currentTarget
                          ) {
                            event.preventDefault();
                            startCardFieldEdit(
                              "description",
                              card.description ?? "",
                            );
                          }
                        }}
                        className="-mx-2 mt-3 cursor-text rounded-md px-2 py-1 transition-colors hover:bg-[var(--color-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                      >
                        {/* Descriptions are stored as Markdown; rendered
                            safely (sanitized) with clickable checklists. */}
                        <CardDescriptionViewer
                          content={card.description}
                          onContentChange={async (description) => {
                            await updateMutation.mutateAsync({
                              action: "description",
                              description,
                            });
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startCardFieldEdit("description", "")}
                        className="mt-3 w-full cursor-text rounded-lg border border-dashed px-4 py-6 text-left text-sm transition-colors hover:bg-[var(--color-card-hover)]"
                        style={{
                          borderColor: "var(--color-border)",
                          ...muted,
                        }}
                      >
                        Add a description...
                      </button>
                    )}
                  </section>

                  {/* Attachments */}
                  <section
                    aria-labelledby="attachments-heading"
                    className="mt-8 border-t pt-6"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2
                        id="attachments-heading"
                        className="flex items-center gap-2 text-sm font-semibold"
                        style={primary}
                      >
                        <Paperclip size={16} style={secondary} />
                        Attachments
                        {!attachmentsLoading && !attachmentsError && (
                          <span className="text-xs font-normal" style={muted}>
                            ({attachments.length})
                          </span>
                        )}
                      </h2>
                    </div>

                    {attachmentsLoading ? (
                      <p className="text-sm" style={secondary}>
                        Loading attachments...
                      </p>
                    ) : attachmentsError ? (
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-tag-red-text)" }}
                      >
                        Attachments could not be loaded. Please try again.
                      </p>
                    ) : attachments.length === 0 ? (
                      <div
                        className="rounded-lg border border-dashed p-5 text-sm"
                        style={{
                          borderColor: "var(--color-border)",
                          ...muted,
                        }}
                      >
                        No attachments yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {attachments.map((attachment) => {
                          const isImage =
                            attachment.contentType?.startsWith("image/") ||
                            /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(
                              attachment.fileName,
                            );

                          return (
                            <a
                              key={attachment.id}
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Open attachment ${attachment.fileName}`}
                              className="group min-w-0 overflow-hidden rounded-lg border transition hover:shadow-sm"
                              style={{
                                borderColor: "var(--color-border)",
                                backgroundColor: "var(--color-column-bg)",
                              }}
                            >
                              <div
                                className="flex h-32 items-center justify-center overflow-hidden border-b"
                                style={{
                                  borderColor: "var(--color-border)",
                                }}
                              >
                                {isImage ? (
                                  <Image
                                    src={attachment.fileUrl}
                                    alt={attachment.fileName}
                                    width={200}
                                    height={128}
                                    unoptimized
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <FileText size={30} style={secondary} />
                                )}
                              </div>

                              <div className="flex min-w-0 items-center gap-2 p-3">
                                {isImage ? (
                                  <ImageIcon
                                    size={16}
                                    className="shrink-0"
                                    style={secondary}
                                  />
                                ) : (
                                  <FileText
                                    size={16}
                                    className="shrink-0"
                                    style={secondary}
                                  />
                                )}

                                <div className="min-w-0 flex-1">
                                  <p
                                    className="truncate text-sm font-medium"
                                    title={attachment.fileName}
                                    style={primary}
                                  >
                                    {attachment.fileName}
                                  </p>
                                  <p className="mt-0.5 text-xs" style={muted}>
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>

                                <ExternalLink
                                  size={14}
                                  className="shrink-0 opacity-60 group-hover:opacity-100"
                                  style={secondary}
                                />
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              </article>

              {/* Card properties */}
              <aside
                className="min-w-0 rounded-xl border p-5 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1"
                style={surface}
                aria-label="Card properties"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold" style={primary}>
                    Details
                  </h2>

                  <div className="relative" ref={cardMenuRef}>
                    <button
                      type="button"
                      aria-label="Card options"
                      aria-haspopup="menu"
                      aria-expanded={isCardMenuOpen}
                      onClick={() => setIsCardMenuOpen((open) => !open)}
                      className="rounded-md p-1.5 transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-1 dark:hover:bg-white/5"
                      style={secondary}
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {isCardMenuOpen && (
                      <div
                        role="menu"
                        aria-label="Card options"
                        className="absolute right-0 top-full z-20 mt-1 min-w-40 rounded-lg border p-1 shadow-lg"
                        style={{
                          backgroundColor: "var(--color-card-bg)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setIsCardMenuOpen(false);
                            deleteCardMutation.reset();
                            setIsDeleteDialogOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                          style={{ color: "var(--color-tag-red-text)" }}
                        >
                          <Trash2 size={15} />
                          Delete Card
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <dl className="space-y-3">
                  {/* Status = the list the card is in (move cards on the board) */}
                  <Property label="Status" icon={<KanbanSquare size={15} />}>
                    {cardList ? (
                      <span
                        className="inline-flex max-w-full items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                        style={
                          isInLastList
                            ? {
                                backgroundColor: "var(--color-tag-green-bg)",
                                color: "var(--color-tag-green-text)",
                              }
                            : {
                                backgroundColor: "var(--color-tag-neutral-bg)",
                                color: "var(--color-tag-neutral-text)",
                              }
                        }
                      >
                        <span className="truncate">{cardList.listName}</span>
                      </span>
                    ) : (
                      <span className="text-sm" style={muted}>
                        —
                      </span>
                    )}
                  </Property>

                  <Property
                    label="Type"
                    icon={<TaskTypeIcon type={card.type} />}
                  >
                    <FieldSelect
                      label="type"
                      value={card.type}
                      options={(["task", "bug", "feature", "tbd"] as TaskType[]).map(
                        (type) => ({
                          value: type,
                          label: formatLabel(type),
                          marker: <TaskTypeIcon type={type} />,
                        }),
                      )}
                      onChange={(type) => update({ action: "taskType", type })}
                    >
                      {formatLabel(card.type)}
                    </FieldSelect>
                  </Property>

                  <Property label="Priority" icon={<CircleDot size={15} />}>
                    <FieldSelect
                      label="priority"
                      value={card.priority}
                      options={(
                        [
                          "normal",
                          "show stopper",
                          "critical",
                          "major",
                          "minor",
                        ] as CardPriority[]
                      ).map((priority) => ({
                        value: priority,
                        label: formatLabel(priority),
                        marker: <PriorityDot priority={priority} />,
                      }))}
                      onChange={(priority) =>
                        update({ action: "priority", priority })
                      }
                    >
                      <span className="inline-flex items-center gap-2">
                        <PriorityDot priority={card.priority} />
                        {formatLabel(card.priority)}
                      </span>
                    </FieldSelect>
                  </Property>

                  <Property label="Assignee" icon={<Target size={15} />}>
                    <FieldSelect
                      label="assignee"
                      value={card.assignedTo ?? ""}
                      options={[
                        { value: "", label: "Unassigned" },
                        // Keep a current assignee who is no longer a member.
                        ...(card.assignedTo &&
                        !members.some(
                          (member) => member.userId === card.assignedTo,
                        )
                          ? [
                              {
                                value: card.assignedTo,
                                label: card.assigneeName ?? card.assignedTo,
                              },
                            ]
                          : []),
                        ...members.map((member) => ({
                          value: member.userId,
                          label: member.name,
                        })),
                      ]}
                      onChange={(assignedTo) =>
                        update({
                          action: "assignedTo",
                          assignedTo: assignedTo || null,
                        })
                      }
                    >
                      {members.find(
                        (member) => member.userId === card.assignedTo,
                      )?.name ??
                        card.assigneeName ??
                        card.assignedToName ??
                        card.assignee ??
                        card.assignedTo ??
                        "Unassigned"}
                    </FieldSelect>
                  </Property>

                  {(["estimateTime", "spentTime"] as const).map((field) => (
                    <Property
                      key={field}
                      label={
                        field === "estimateTime" ? "Estimate" : "Time spent"
                      }
                      icon={<Clock3 size={15} />}
                    >
                      {editingTime === field ? (
                        <input
                          autoFocus
                          type="number"
                          min="0"
                          step="any"
                          aria-label={
                            field === "estimateTime"
                              ? "Estimated time"
                              : "Spent time"
                          }
                          // Border colour in classes (not inputStyle) so focus can
                          // change it; replaces the browser's light focus outline.
                          className="w-full min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-input-bg)] px-2 py-1.5 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-tag-neutral-bg)]"
                          value={timeDraft}
                          onChange={(event) => setTimeDraft(event.target.value)}
                          placeholder="e.g. 120"
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              cancelTimeBlurRef.current = true;
                              setEditingTime(null);
                            }

                            if (event.key === "Enter") {
                              event.preventDefault();
                              event.currentTarget.blur();
                            }
                          }}
                          onBlur={(event) => {
                            if (cancelTimeBlurRef.current) {
                              cancelTimeBlurRef.current = false;
                              return;
                            }

                            handleSaveTime(field, event.currentTarget.value);
                          }}
                        />
                      ) : (
                        <InlineValue
                          onClick={() => {
                            setEditingField(null);
                            cancelTimeBlurRef.current = false;
                            setEditingTime(field);
                            setTimeDraft(String(card[field] ?? ""));
                          }}
                        >
                          {card[field] !== null &&
                          card[field] !== undefined &&
                          card[field] !== ""
                            ? `${card[field]} ${Number(card[field]) === 1 ? "hour" : "hours"}`
                            : "Not set"}
                        </InlineValue>
                      )}
                    </Property>
                  ))}

                  {/* Editable start date */}
                  <Property
                    label="Start date"
                    icon={<CalendarDays size={15} />}
                  >
                    <DateField
                      label="start date"
                      value={card.startDate?.slice(0, 10) ?? ""}
                      max={card.dueDate?.slice(0, 10)}
                      onChange={(startDate) =>
                        update({ action: "startDate", startDate })
                      }
                    >
                      {card.startDate
                        ? formatCardDate(card.startDate)
                        : "Set start date"}
                    </DateField>
                  </Property>

                  {/* Editable due date */}
                  <Property label="Due date" icon={<Clock3 size={15} />}>
                    <DateField
                      label="due date"
                      value={card.dueDate?.slice(0, 10) ?? ""}
                      min={card.startDate?.slice(0, 10)}
                      onChange={(dueDate) => update({ action: "dueDate", dueDate })}
                    >
                      {card.dueDate
                        ? formatCardDate(card.dueDate)
                        : "Set due date"}
                    </DateField>
                  </Property>

                  {card.completedAt && (
                    <Property
                      label="Completed"
                      icon={<CheckCircle2 size={15} />}
                    >
                      {formatCardDate(card.completedAt)}
                    </Property>
                  )}

                  <Property label="Sprint" icon={<Layers3 size={15} />}>
                    {editingField === "sprint" ? (
                      <div
                        className="relative w-full"
                        onBlur={(event) => {
                          if (
                            !event.currentTarget.contains(
                              event.relatedTarget as Node | null,
                            )
                          ) {
                            setEditingField(null);
                          }
                        }}
                      >
                        <button
                          type="button"
                          autoFocus
                          aria-label="Change sprint"
                          aria-expanded="true"
                          aria-controls={`sprint-options-${cardId}`}
                          className="w-full rounded-md border px-2 py-1.5 text-left text-sm"
                          style={inputStyle}
                        >
                          {(card.sprintId ?? [])
                            .map(
                              (sprintId) =>
                                sprints.find(
                                  (sprint) => sprint.id === sprintId,
                                )?.name,
                            )
                            .filter((name): name is string => Boolean(name))
                            .join(", ") || "Select sprints"}
                        </button>
                        <div
                          id={`sprint-options-${cardId}`}
                          className={`absolute right-0 z-30 w-[max(100%,15rem)] rounded-lg border p-2 shadow-lg ${placementClass[sprintPlacement]}`}
                          style={{
                            backgroundColor: "var(--color-card-bg)",
                            borderColor: "var(--color-border)",
                          }}
                          role="group"
                          aria-label="Sprint options"
                        >
                          {sprints.length > 0 ? (
                            <div className="space-y-1">
                              {sprints.map((sprint) => {
                                const selected = (card.sprintId ?? []).includes(
                                  sprint.id,
                                );

                                return (
                                  <label
                                    key={sprint.id}
                                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                                    style={{
                                      color: "var(--color-text-primary)",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={() => {
                                        const currentIds = card.sprintId ?? [];
                                        update({
                                          action: "sprint",
                                          sprintId: selected
                                            ? currentIds.filter(
                                                (id) => id !== sprint.id,
                                              )
                                            : [...currentIds, sprint.id],
                                        });
                                      }}
                                      className="accent-[var(--color-primary)]"
                                    />
                                    <span className="min-w-0 flex-1 truncate">
                                      {sprint.name}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <p
                              className="px-2 py-1.5 text-sm"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              No sprints available
                            </p>
                          )}
                          <div
                            className="mt-2 flex justify-end border-t pt-2"
                            style={{ borderColor: "var(--color-border)" }}
                          >
                            <button
                              type="button"
                              onClick={() => setEditingField(null)}
                              className="rounded-md px-2 py-1 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5"
                              style={{ color: "var(--color-primary)" }}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <InlineValue
                        onClick={(event) => {
                          // Options plus the Done row; capped like the lists.
                          setSprintPlacement(
                            choosePlacement(
                              event.currentTarget,
                              Math.min(sprints.length * 36 + 72, 340),
                            ),
                          );
                          setEditingField("sprint");
                        }}
                      >
                        {(card.sprintId ?? [])
                          .map(
                            (sprintId) =>
                              sprints.find((sprint) => sprint.id === sprintId)
                                ?.name,
                          )
                          .filter((name): name is string => Boolean(name))
                          .join(", ") ||
                          card.sprintName ||
                          "No sprint"}
                      </InlineValue>
                    )}
                  </Property>
                </dl>
              </aside>

              {/* Comments: own grid item so phones show Details first */}
              <section
                className="min-w-0 rounded-xl border p-5 sm:p-7 lg:col-start-1 lg:row-start-2 lg:p-8"
                style={surface}
                aria-label="Comments"
              >
                <CardCommits
                  workspaceId={workspaceId}
                  boardId={boardId}
                  cardId={cardId}
                />
              </section>
            </div>

            {/* Delete confirmation */}
            <ConfirmDialog
              isOpen={isDeleteDialogOpen}
              title="Delete card?"
              description={
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    &quot;{card.title}&quot;
                  </span>
                  ? This action cannot be undone.
                </>
              }
              icon={<Trash2 size={20} />}
              confirmLabel="Delete card"
              pendingLabel="Deleting..."
              isPending={deleteCardMutation.isPending}
              error={
                deleteCardMutation.isError
                  ? deleteCardMutation.error instanceof Error
                    ? deleteCardMutation.error.message
                    : "Unable to delete this card."
                  : null
              }
              onConfirm={() => deleteCardMutation.mutate()}
              onCancel={() => setIsDeleteDialogOpen(false)}
            />
          </>
        ) : null}
      </div>
    </main>
  );
}

// Trigger shared by FieldSelect and DateField: looks like plain text until
// hovered, opens its popover on a single click.
const fieldTriggerClass =
  "group -mx-2 flex w-[calc(100%+1rem)] min-w-0 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 dark:hover:bg-white/5";

const popoverClass =
  "absolute right-0 z-30 rounded-lg border shadow-lg outline-none";

type Placement = "below" | "above";

const placementClass: Record<Placement, string> = {
  below: "top-full mt-1",
  above: "bottom-full mb-1",
};

// Details is sticky, so a popover that runs past the bottom of the window
// can't be scrolled into view. Open it above the field when there isn't
// room below (and there is more room above).
function choosePlacement(trigger: HTMLElement | null, height: number) {
  if (!trigger) return "below";
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;

  return spaceBelow < height && rect.top > spaceBelow ? "above" : "below";
}

const popoverStyle = {
  backgroundColor: "var(--color-card-bg)",
  borderColor: "var(--color-border)",
};

// Closes a popover on a click outside `rootRef`.
function useOutsideClick(
  isOpen: boolean,
  rootRef: RefObject<HTMLElement | null>,
  onOutside: () => void,
) {
  const onOutsideRef = useRef(onOutside);
  useEffect(() => {
    onOutsideRef.current = onOutside;
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOutsideRef.current();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, rootRef]);
}

type FieldOption<T extends string> = {
  value: T;
  label: string;
  marker?: ReactNode;
};

// Single-choice field: one click opens the list, choosing saves. Arrow keys,
// Enter and Esc work while the list is open.
function FieldSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  children,
}: {
  label: string;
  value: T;
  options: FieldOption<T>[];
  onChange: (value: T) => void;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>("below");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  useOutsideClick(isOpen, rootRef, () => setIsOpen(false));

  useEffect(() => {
    if (isOpen) listRef.current?.focus();
  }, [isOpen]);

  const open = () => {
    // Rows are about 36px; the list is capped at 288px (max-h-72).
    setPlacement(
      choosePlacement(
        triggerRef.current,
        Math.min(options.length * 36 + 16, 296),
      ),
    );
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const choose = (next: T) => {
    close();
    if (next !== value) onChange(next);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Change ${label}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={(event) => {
          if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            open();
          }
        }}
        className={fieldTriggerClass}
        style={primary}
      >
        <span className="min-w-0 break-words">{children}</span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`shrink-0 transition-opacity ${
            isOpen ? "opacity-70" : "opacity-0 group-hover:opacity-60"
          }`}
          style={muted}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(options.length - 1, index + 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(0, index - 1));
            } else if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              const option = options[activeIndex];
              if (option) choose(option.value);
            } else if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              close();
            } else if (event.key === "Tab") {
              setIsOpen(false);
            }
          }}
          className={`${popoverClass} ${placementClass[placement]} max-h-72 w-[max(100%,15rem)] overflow-y-auto p-1`}
          style={popoverStyle}
        >
          {options.map((option, index) => {
            const selected = option.value === value;

            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option.value)}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
                  index === activeIndex ? "bg-black/5 dark:bg-white/10" : ""
                }`}
                style={primary}
              >
                {option.marker && (
                  <span className="flex shrink-0 items-center" style={secondary}>
                    {option.marker}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {selected && (
                  <Check
                    size={15}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--color-primary)]"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// "YYYY-MM-DD" in local time, the format the date fields send.
function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function monthOf(key: string) {
  const [year, month] = key.split("-").map(Number);

  return year && month
    ? new Date(year, month - 1, 1)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
}

// Date field: one click opens a calendar; picking a day saves and closes,
// picking the selected day again clears it. No Save/Cancel/Clear buttons.
function DateField({
  label,
  value,
  min,
  max,
  onChange,
  children,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string | null) => void;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>("below");
  const [month, setMonth] = useState(() => monthOf(value));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useOutsideClick(isOpen, rootRef, () => setIsOpen(false));

  // Start on the selected day (or today) so the keyboard lands somewhere useful.
  useEffect(() => {
    if (!isOpen) return;
    calendarRef.current
      ?.querySelector<HTMLButtonElement>(
        '[data-selected="true"], [data-today="true"]',
      )
      ?.focus();
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const pick = (key: string) => {
    close();
    onChange(key === value ? null : key);
  };

  const todayKey = toDateKey(new Date());
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Change ${label}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            return;
          }
          setMonth(monthOf(value));
          // The calendar is about 320px tall with six week rows.
          setPlacement(choosePlacement(triggerRef.current, 330));
          setIsOpen(true);
        }}
        className={fieldTriggerClass}
        style={primary}
      >
        <span className="min-w-0 break-words">{children}</span>
        <CalendarDays
          size={15}
          aria-hidden="true"
          className={`shrink-0 transition-opacity ${
            isOpen ? "opacity-70" : "opacity-0 group-hover:opacity-60"
          }`}
          style={muted}
        />
      </button>

      {isOpen && (
        <div
          ref={calendarRef}
          role="dialog"
          aria-label={`Choose ${label}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              close();
            }
          }}
          className={`${popoverClass} ${placementClass[placement]} w-[17rem] p-3`}
          style={popoverStyle}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: "var(--color-border)", ...secondary }}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold" style={primary}>
              {month.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: "var(--color-border)", ...secondary }}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[11px] font-medium"
                style={muted}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: month.getDay() }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const date = new Date(
                month.getFullYear(),
                month.getMonth(),
                index + 1,
              );
              const key = toDateKey(date);
              const isSelected = key === value;
              const isToday = key === todayKey;
              // Start can't be after the due date, due can't be before start.
              const isDisabled =
                (min !== undefined && key < min) ||
                (max !== undefined && key > max);

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isDisabled}
                  data-selected={isSelected || undefined}
                  data-today={isToday || undefined}
                  onClick={() => pick(key)}
                  aria-label={`${date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}${isSelected ? ", selected, click to clear" : ""}`}
                  aria-pressed={isSelected}
                  className={`flex h-8 items-center justify-center rounded-lg text-xs transition disabled:cursor-not-allowed disabled:opacity-35 ${
                    isSelected
                      ? "bg-[var(--color-primary)] font-bold text-white"
                      : "hover:bg-black/5 dark:hover:bg-white/10"
                  } ${
                    isToday && !isSelected
                      ? "outline outline-1 outline-[var(--color-primary)]"
                      : ""
                  }`}
                  style={isSelected ? undefined : primary}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <p
            className="mt-3 border-t pt-2 text-xs"
            style={{ borderColor: "var(--color-border)", ...muted }}
          >
            {value
              ? "Pick a day to change it, or the selected day to clear it."
              : "Pick a day to set it."}
          </p>
        </div>
      )}
    </div>
  );
}

function PriorityDot({ priority }: { priority: CardPriority }) {
  return (
    <span
      aria-hidden="true"
      className="h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: getPriorityColor(priority) }}
    />
  );
}

function InlineValue({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Click to edit"
      className="-mx-2 w-[calc(100%+1rem)] min-w-0 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-default dark:hover:bg-white/5"
      style={primary}
    >
      <span className="break-words">{children}</span>
    </button>
  );
}

function Property({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-start gap-3 text-sm">
      <dt
        className="flex min-w-0 items-center gap-1 pt-1 text-xs"
        style={muted}
      >
        <span className="shrink-0">{icon}</span>
        <span className="whitespace-nowrap">{label}</span>
      </dt>

      <dd className="min-w-0 font-medium" style={primary}>
        {children}
      </dd>
    </div>
  );
}

function TaskTypeIcon({ type }: { type?: TaskType | null }) {
  switch (type) {
    case "bug":
      return <Bug size={14} />;
    case "feature":
      return <Sparkles size={14} />;
    case "tbd":
      return <Clock3 size={14} />;
    default:
      return <CheckCircle2 size={14} />;
  }
}

function formatLabel(value?: string | null) {
  if (!value) return "Task";

  return value === "tbd"
    ? "TBD"
    : value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCardDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "File";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
