// "use client";

// import { useState, useEffect } from "react";
// import { createPortal } from "react-dom";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   CalendarDays,
//   Check,
//   ChevronLeft,
//   ChevronRight,
//   File,
//   FileImage,
//   FileText,
//   Paperclip,
//   Plus,
//   X,
// } from "lucide-react";
// import CardDescriptionEditor from "@/components/card/CardDescriptionEditor";

// type CardPriority = "normal" | "show stopper" | "critical" | "major" | "minor";
// type TaskType = "bug" | "feature" | "task" | "tbd";

// type CardType = {
//   id: string;
//   boardId: string;
//   boardListId: string;
//   sprintId: string[];
//   sprintName?: string | null;
//   cardNumber: number;
//   title: string;
//   description: string | null;
//   priority: CardPriority;
//   type: TaskType;
//   position: number;
//   reporterId: string;
//   startDate: string | null;
//   dueDate: string | null;
//   completedAt: string | null;
//   isArchived: boolean;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: string | null;
// };

// type CardProps = {
//   card?: CardType;
//   workspaceId: string;
//   boardId: string;
//   listId: string;
//   listName: string;
//   sprintName?: string | null;
//   triggerLabel?: string;
//   triggerClassName?: string;
//   triggerAriaLabel?: string;
//   triggerDisabled?: boolean;
//   triggerIconSize?: number;
//   activeSprintId?: string | null;
//   onCreateClick?: () => void;
//   onCardClick?: (cardId: string) => void;
// };

// type CreateCardPayload = {
//   title: string;
//   description: string;
//   startDate: string;
//   dueDate: string;
//   priority: CardPriority;
//   type: TaskType;
//   sprintId: string[];
//   sprintName?: string | null;
//   listId: string;
//   assigneeId: string | null;
// };

// type CreateCardVariables = {
//   payload: CreateCardPayload;
//   files: File[];
// };

// const priorities: CardPriority[] = [
//   "normal",
//   "show stopper",
//   "critical",
//   "major",
//   "minor",
// ];

// const taskTypes: { value: TaskType; label: string }[] = [
//   { value: "task", label: "Task" },
//   { value: "feature", label: "Feature" },
//   { value: "bug", label: "Bug" },
//   { value: "tbd", label: "TBD" },
// ];
// type BoardMemberApiResponse = {
//   id?: string;
//   userId?: string;
//   name?: string;
//   fullName?: string;
//   email?: string;
//   user?: {
//     id?: string;
//     name?: string;
//     fullName?: string;
//     email?: string;
//   };
// };

// // Keep in sync with the backend's file-size limit.
// const MAX_FILE_SIZE = 4 * 1024 * 1024;
// const MAX_TOTAL_FILES = 10;

// const allowedTypes = new Set([
//   "image/jpeg",
//   "image/png",
//   "image/webp",
//   "application/pdf",
//   "text/plain",
//   "application/zip",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
// ]);

// type Sprint = {
//   id: string;
//   name: string;
//   status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
// };
// function getPriorityColor(priority: CardPriority) {
//   switch (priority) {
//     case "normal":
//       return "#3b82f6";
//     case "show stopper":
//       return "#a855f7";
//     case "critical":
//       return "#ef4444";
//     case "major":
//       return "#eab308";
//     case "minor":
//       return "#9ca3af";
//     default:
//       return "var(--color-border)";
//   }
// }

// type BoardMember = {
//   userId: string;
//   name: string;
//   email: string;
// };
// function formatCardDate(date: string | null) {
//   if (!date) return "";

//   const parsedDate = new Date(`${date}T12:00:00`);

//   if (Number.isNaN(parsedDate.getTime())) return date;

//   return parsedDate.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// }

// function capitalize(value: string) {
//   return value.charAt(0).toUpperCase() + value.slice(1);
// }

// function toDateKey(date: Date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// }

// function formatDateLabel(date: string) {
//   if (!date) return "Select date";

//   return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// }

// // function getCreatedCardId(data: any): string | undefined {
// //   return data?.card?.id ?? data?.data?.card?.id ?? data?.data?.id ?? data?.id;
// // }
// type CreateCardResponse = {
//   id?: string;
//   card?: {
//     id?: string;
//   };
//   data?: {
//     id?: string;
//     card?: {
//       id?: string;
//     };
//   };
// };

// function getCreatedCardId(data: CreateCardResponse): string | undefined {
//   return data?.card?.id ?? data?.data?.card?.id ?? data?.data?.id ?? data?.id;
// }

// export default function CreateCard({
//   card,
//   workspaceId,
//   boardId,
//   listId,
//   listName,
//   sprintName,
//   triggerLabel = "Add card",
//   triggerClassName,
//   triggerAriaLabel,
//   triggerDisabled = false,
//   triggerIconSize = 16,
//   activeSprintId = null,
//   onCreateClick,
//   onCardClick,
// }: CardProps) {
//   const queryClient = useQueryClient();

//   const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
//   const [cardTitle, setCardTitle] = useState("");
//   const [cardDescription, setCardDescription] = useState("");
//   const [cardStartDate, setCardStartDate] = useState("");
//   const [cardEndDate, setCardEndDate] = useState("");
//   const [cardPriority, setCardPriority] = useState<CardPriority>("normal");
//   const [cardType, setCardType] = useState<TaskType>("task");

//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [fileError, setFileError] = useState("");
//   const [attachmentError, setAttachmentError] = useState("");
//   const [cardCreated, setCardCreated] = useState(false);
//   const [isCalendarOpen, setIsCalendarOpen] = useState(false);
//   const [calendarMonth, setCalendarMonth] = useState(() => {
//     const now = new Date();
//     return new Date(now.getFullYear(), now.getMonth(), 1);
//   });

//   /* sprint  */
//   const [sprints, setSprints] = useState<Sprint[]>([]);
//   const [selectedSprintId, setSelectedSprintId] = useState(
//     activeSprintId ?? "",
//   );
//   const [isLoadingSprints, setIsLoadingSprints] = useState(false);
//   const [sprintError, setSprintError] = useState("");
//   /* assigned ticket to someone */
//   const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
//   const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
//   const [isLoadingMembers, setIsLoadingMembers] = useState(false);
//   const [memberError, setMemberError] = useState("");
//   const createCardMutation = useMutation({
//     mutationFn: async ({ payload, files }: CreateCardVariables) => {
//       // 1. Create the card first.
//       const response = await fetch(
//         `/api/workspace/${workspaceId}/board/${boardId}/card`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         },
//       );

//       const data = await response.json().catch(() => null);

//       if (!response.ok) {
//         throw new Error(data?.message ?? "Failed to create card.");
//       }

//       const newCardId = getCreatedCardId(data);

//       if (!newCardId) {
//         throw new Error(
//           "The card may have been created, but the API response did not include its ID. Check the create-card response before retrying.",
//         );
//       }

//       // 2. Upload files using the ID returned by the create-card API.
//       const failedFiles: string[] = [];

//       for (const file of files) {
//         const formData = new FormData();
//         formData.append("file", file);

//         try {
//           const uploadResponse = await fetch(
//             `/api/workspace/${workspaceId}/board/${boardId}/card/${newCardId}/attachment`,
//             {
//               method: "POST",
//               body: formData,
//             },
//           );

//           if (!uploadResponse.ok) {
//             const uploadResult = await uploadResponse.json().catch(() => null);
//             failedFiles.push(
//               `${file.name}: ${uploadResult?.message ?? "Upload failed"}`,
//             );
//           }
//         } catch {
//           failedFiles.push(`${file.name}: Network error`);
//         }
//       }

//       return {
//         cardId: newCardId,
//         failedFiles,
//       };
//     },

//     onSuccess: async (result) => {
//       await Promise.all([
//         queryClient.invalidateQueries({
//           queryKey: ["board-cards", workspaceId, boardId],
//         }),
//         queryClient.invalidateQueries({
//           queryKey: ["board-cards", workspaceId, boardId, activeSprintId],
//         }),
//       ]);

//       if (result.failedFiles.length > 0) {
//         // The card exists. Do not allow another click to create a duplicate.
//         setCardCreated(true);
//         setAttachmentError(
//           `Card created, but these attachments failed: ${result.failedFiles.join("; ")}. Close this form and retry the failed files from the card details.`,
//         );
//         return;
//       }

//       closeCreateCardModal();
//     },

//     onError: (error) => {
//       console.error("CREATE_CARD_ERROR:", error);
//     },
//   });

//   useEffect(() => {
//     if (!isCreateCardOpen) return;

//     const controller = new AbortController();

//     async function fetchSprints() {
//       setIsLoadingSprints(true);
//       setSprintError("");

//       try {
//         const response = await fetch(
//           `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
//           { signal: controller.signal },
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data?.message ?? "Failed to load sprints.");
//         }

//         const sprintList: Sprint[] = Array.isArray(data)
//           ? data
//           : (data.sprints ?? data.data?.sprints ?? data.data ?? []);

//         setSprints(sprintList);

//         // Prefer the active sprint initially, if one exists.
//         setSelectedSprintId((current) => {
//           if (current && sprintList.some((s) => s.id === current)) {
//             return current;
//           }

//           return sprintList.find((s) => s.status === "ACTIVE")?.id ?? "";
//         });
//       } catch (error) {
//         if (error instanceof Error && error.name !== "AbortError") {
//           setSprintError(error.message);
//         }
//       } finally {
//         if (!controller.signal.aborted) {
//           setIsLoadingSprints(false);
//         }
//       }
//     }

//     void fetchSprints();

//     return () => controller.abort();
//   }, [isCreateCardOpen, workspaceId, boardId, activeSprintId]);
//   useEffect(() => {
//     if (!isCreateCardOpen) return;

//     const controller = new AbortController();

//     async function fetchBoardMembers() {
//       setIsLoadingMembers(true);
//       setMemberError("");

//       try {
//         const response = await fetch(
//           `/api/workspace/${workspaceId}/board/${boardId}/boardMembers?all=true`,
//           { signal: controller.signal },
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data?.message ?? "Failed to load board members.");
//         }

//         // Adjust this mapping to your actual GET response.
//         const members = Array.isArray(data)
//           ? data
//           : (data.members ?? data.data?.members ?? data.data ?? []);

//         setBoardMembers(
//           members
//             .map((member: BoardMemberApiResponse) => ({
//               userId: member.userId ?? member.user?.id ?? member.id,
//               name:
//                 member.user?.name ??
//                 member.name ??
//                 member.user?.fullName ??
//                 member.fullName ??
//                 member.email ??
//                 "Unnamed member",
//               email: member.user?.email ?? member.email ?? "",
//             }))
//             .filter((member: BoardMember) => member.userId),
//         );
//       } catch (error) {
//         if (error instanceof Error && error.name !== "AbortError") {
//           setMemberError(error.message);
//         }
//       } finally {
//         if (!controller.signal.aborted) {
//           setIsLoadingMembers(false);
//         }
//       }
//     }

//     void fetchBoardMembers();

//     return () => controller.abort();
//   }, [isCreateCardOpen, workspaceId, boardId]);
//   const resetForm = () => {
//     setCardTitle("");
//     setCardDescription("");
//     setCardStartDate("");
//     setCardEndDate("");
//     setCardPriority("normal");
//     setCardType("task");
//     setSelectedFiles([]);
//     setFileError("");
//     setAttachmentError("");
//     setCardCreated(false);
//     setIsCalendarOpen(false);
//     setSelectedAssigneeId("");
//   };

//   const openCreateCardModal = () => {
//     createCardMutation.reset();
//     resetForm();
//     setIsCreateCardOpen(true);
//     onCreateClick?.();
//   };

//   const closeCreateCardModal = () => {
//     if (createCardMutation.isPending) return;

//     setIsCreateCardOpen(false);
//     resetForm();
//     createCardMutation.reset();
//   };

//   const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const incomingFiles = Array.from(event.target.files ?? []);

//     setFileError("");
//     setAttachmentError("");

//     const nextFiles = [...selectedFiles];

//     for (const file of incomingFiles) {
//       if (!allowedTypes.has(file.type)) {
//         setFileError(`${file.name}: This file type is not supported.`);
//         continue;
//       }

//       if (file.size > MAX_FILE_SIZE) {
//         setFileError(`${file.name}: Each file must be 4 MB or smaller.`);
//         continue;
//       }

//       if (
//         nextFiles.some(
//           (existing) =>
//             existing.name === file.name &&
//             existing.size === file.size &&
//             existing.lastModified === file.lastModified,
//         )
//       ) {
//         continue;
//       }

//       if (nextFiles.length >= MAX_TOTAL_FILES) {
//         setFileError(`You can attach up to ${MAX_TOTAL_FILES} files.`);
//         break;
//       }

//       nextFiles.push(file);
//     }

//     setSelectedFiles(nextFiles);

//     // Allow choosing the same file again after removing it.
//     event.target.value = "";
//   };

//   const handleCreateCard = () => {
//     const title = cardTitle.trim();

//     if (!title || cardCreated || createCardMutation.isPending) return;

//     if (cardStartDate && cardEndDate && cardEndDate < cardStartDate) {
//       setFileError("");
//       setAttachmentError("The due date must be on or after the start date.");
//       return;
//     }

//     setAttachmentError("");

//     createCardMutation.mutate({
//       payload: {
//         title,
//         description: cardDescription.trim(),
//         startDate: cardStartDate,
//         dueDate: cardEndDate,
//         priority: cardPriority,
//         type: cardType,
//         sprintId: selectedSprintId ? [selectedSprintId] : [],
//         sprintName:
//           sprints.find((sprint) => sprint.id === selectedSprintId)?.name ??
//           null,
//         listId,
//         assigneeId: selectedAssigneeId || null,
//       },
//       files: [...selectedFiles],
//     });
//   };

//   if (card) {
//     return (
//       <div
//         role="button"
//         tabIndex={0}
//         onClick={() => onCardClick?.(card.id)}
//         onKeyDown={(event) => {
//           if (event.key === "Enter" || event.key === " ") {
//             event.preventDefault();
//             onCardClick?.(card.id);
//           }
//         }}
//         className="group cursor-pointer rounded-lg border border-l-4 p-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
//         style={{
//           backgroundColor: "var(--color-card-bg)",
//           borderColor: "var(--color-border)",
//           borderLeftColor: getPriorityColor(card.priority),
//         }}
//       >
//         <div className="mb-2 flex items-center justify-between gap-2">
//           <span
//             className="text-[10px] font-semibold"
//             style={{ color: "var(--color-text-muted)" }}
//           >
//             {sprintName
//               ? `${sprintName}_${card.cardNumber}`
//               : `CARD-${card.cardNumber}`}
//           </span>

//           <div className="flex items-center gap-1.5">
//             {card.type && (
//               <span
//                 className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium"
//                 style={{
//                   borderColor: "var(--color-border)",
//                   color: "var(--color-text-secondary)",
//                 }}
//               >
//                 {capitalize(card.type)}
//               </span>
//             )}

//             <span
//               className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
//               style={{
//                 backgroundColor: "var(--color-column-bg)",
//                 color: "var(--color-text-secondary)",
//               }}
//             >
//               {capitalize(card.priority)}
//             </span>
//           </div>
//         </div>

//         <p
//           className="line-clamp-2 text-sm font-medium leading-5"
//           style={{ color: "var(--color-text-primary)" }}
//         >
//           {card.title}
//         </p>

//         {card.description && (
//           <div
//             className="mt-1 line-clamp-2 text-xs leading-4"
//             style={{ color: "var(--color-text-muted)" }}
//           >
//             {card.description
//               .replace(/<br\s*\/?>/gi, " ")
//               .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, " ")
//               .replace(/<[^>]*>/g, "")
//               .replace(/&nbsp;/gi, " ")
//               .replace(/&amp;/gi, "&")
//               .replace(/&lt;/gi, "<")
//               .replace(/&gt;/gi, ">")
//               .replace(/&quot;/gi, '"')
//               .replace(/&#39;/gi, "'")
//               .replace(/\s+/g, " ")
//               .trim()}
//           </div>
//         )}

//         {(card.startDate || card.dueDate) && (
//           <div
//             className="mt-3 flex items-center gap-1 text-[10px]"
//             style={{ color: "var(--color-text-muted)" }}
//           >
//             <CalendarDays size={12} />
//             <span>
//               {formatCardDate(card.startDate)}
//               {card.dueDate ? ` → ${formatCardDate(card.dueDate)}` : ""}
//             </span>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <>
//       <button
//         type="button"
//         disabled={triggerDisabled}
//         aria-label={triggerAriaLabel}
//         onClick={openCreateCardModal}
//         className={
//           triggerClassName ??
//           "mx-2 mb-2 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
//         }
//         style={
//           triggerClassName ? undefined : { color: "var(--color-text-muted)" }
//         }
//       >
//         <Plus size={triggerIconSize} />
//         <span>{triggerLabel}</span>
//       </button>

//       {isCreateCardOpen &&
//         typeof document !== "undefined" &&
//         createPortal(
//           <div
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
//             onClick={(event) => {
//               if (event.target === event.currentTarget) {
//                 closeCreateCardModal();
//               }
//             }}
//           >
//             <div
//               className="card-scroll max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border shadow-2xl"
//               style={{
//                 backgroundColor: "var(--color-card-bg)",
//                 borderColor: "var(--color-border)",
//               }}
//             >
//               {/* Modal header */}
//               <div
//                 className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6"
//                 style={{
//                   backgroundColor: "var(--color-card-bg)",
//                   borderColor: "var(--color-border)",
//                 }}
//               >
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <span
//                       className="flex h-9 w-9 items-center justify-center rounded-xl"
//                       style={{
//                         backgroundColor: "var(--color-column-bg)",
//                         color: "var(--color-primary)",
//                       }}
//                     >
//                       <Plus size={18} />
//                     </span>
//                     <div>
//                       <h2
//                         className="text-lg font-semibold"
//                         style={{ color: "var(--color-text-primary)" }}
//                       >
//                         Create card
//                       </h2>
//                       <p
//                         className="mt-0.5 text-xs"
//                         style={{ color: "var(--color-text-muted)" }}
//                       >
//                         Add a task, details, dates and attachments.
//                       </p>
//                     </div>
//                   </div>

//                   <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
//                     <span style={{ color: "var(--color-text-muted)" }}>
//                       Adding to
//                     </span>
//                     <span
//                       className="rounded-md border px-2 py-1 font-medium"
//                       style={{
//                         backgroundColor: "var(--color-column-bg)",
//                         borderColor: "var(--color-border)",
//                         color: "var(--color-text-primary)",
//                       }}
//                     >
//                       {listName}
//                     </span>
//                     <p
//                       className="text-xs leading-5"
//                       style={{ color: "var(--color-text-secondary)" }}
//                     >
//                       {selectedSprintId
//                         ? `This card will be added to ${
//                             sprints.find(
//                               (sprint) => sprint.id === selectedSprintId,
//                             )?.name ?? "the selected sprint"
//                           }.`
//                         : "This card will be created without a sprint."}
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   disabled={createCardMutation.isPending}
//                   onClick={closeCreateCardModal}
//                   className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/5"
//                   style={{ color: "var(--color-text-muted)" }}
//                   aria-label="Close create card form"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>

//               <div className="space-y-6 px-5 py-5 sm:px-6">
//                 {/* Title */}
//                 <section>
//                   <label
//                     htmlFor={`card-title-${listId}`}
//                     className="mb-2 block text-sm font-semibold"
//                     style={{ color: "var(--color-text-primary)" }}
//                   >
//                     Card title <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     id={`card-title-${listId}`}
//                     type="text"
//                     value={cardTitle}
//                     onChange={(event) => setCardTitle(event.target.value)}
//                     placeholder="What needs to be done?"
//                     autoFocus
//                     disabled={cardCreated || createCardMutation.isPending}
//                     className="h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/20"
//                     style={{
//                       backgroundColor: "var(--color-input-bg)",
//                       borderColor: "var(--color-border)",
//                       color: "var(--color-text-primary)",
//                     }}
//                   />
//                 </section>
//                 {/* Sprint  */}
//                 <section>
//                   <label
//                     htmlFor={`card-sprint-${listId}`}
//                     className="mb-2 block text-sm font-semibold"
//                     style={{ color: "var(--color-text-primary)" }}
//                   >
//                     Sprint
//                   </label>

//                   <select
//                     id={`card-sprint-${listId}`}
//                     value={selectedSprintId}
//                     disabled={
//                       isLoadingSprints ||
//                       cardCreated ||
//                       createCardMutation.isPending
//                     }
//                     onChange={(event) =>
//                       setSelectedSprintId(event.target.value)
//                     }
//                     className="h-11 w-full cursor-pointer rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
//                     style={{
//                       backgroundColor: "var(--color-input-bg)",
//                       borderColor: "var(--color-border)",
//                       color: "var(--color-text-primary)",
//                     }}
//                   >
//                     <option
//                       value=""
//                       style={{
//                         backgroundColor: "var(--color-card-bg)",
//                         color: "var(--color-text-primary)",
//                       }}
//                     >
//                       No sprint
//                     </option>

//                     {sprints.map((sprint) => (
//                       <option
//                         key={sprint.id}
//                         value={sprint.id}
//                         style={{
//                           backgroundColor: "var(--color-card-bg)",
//                           color: "var(--color-text-primary)",
//                         }}
//                       >
//                         {sprint.name} ({sprint.status})
//                       </option>
//                     ))}
//                   </select>

//                   {sprintError && (
//                     <p className="mt-2 text-xs text-red-500">{sprintError}</p>
//                   )}

//                   <p
//                     className="mt-2 text-xs"
//                     style={{ color: "var(--color-text-muted)" }}
//                   >
//                     Choose which sprint this card belongs to.
//                   </p>
//                 </section>
//                 {/* assigned to */}
//                 <section>
//                   <label
//                     htmlFor={`card-assignee-${listId}`}
//                     className="mb-2 block text-sm font-semibold"
//                     style={{ color: "var(--color-text-primary)" }}
//                   >
//                     Assign task to
//                   </label>

//                   <select
//                     id={`card-assignee-${listId}`}
//                     value={selectedAssigneeId}
//                     onChange={(event) =>
//                       setSelectedAssigneeId(event.target.value)
//                     }
//                     disabled={
//                       isLoadingMembers ||
//                       cardCreated ||
//                       createCardMutation.isPending
//                     }
//                     className="h-11 w-full cursor-pointer rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
//                     style={{
//                       backgroundColor: "var(--color-input-bg)",
//                       borderColor: "var(--color-border)",
//                       color: "var(--color-text-primary)",
//                     }}
//                   >
//                     <option
//                       value=""
//                       style={{
//                         backgroundColor: "var(--color-card-bg)",
//                         color: "var(--color-text-primary)",
//                       }}
//                     >
//                       Unassigned
//                     </option>

//                     {boardMembers.map((member) => (
//                       <option
//                         key={member.userId}
//                         value={member.userId}
//                         style={{
//                           backgroundColor: "var(--color-card-bg)",
//                           color: "var(--color-text-primary)",
//                         }}
//                       >
//                         {member.name}
//                         {member.email ? ` (${member.email})` : ""}
//                       </option>
//                     ))}
//                   </select>

//                   {isLoadingMembers && (
//                     <p className="mt-2 text-xs">Loading board members...</p>
//                   )}

//                   {memberError && (
//                     <p className="mt-2 text-xs text-red-500">{memberError}</p>
//                   )}
//                 </section>
//                 {/* Task type */}
//                 <section>
//                   <div className="mb-2">
//                     <label
//                       htmlFor={`card-type-${listId}`}
//                       className="text-sm font-semibold"
//                       style={{ color: "var(--color-text-primary)" }}
//                     >
//                       Task type
//                     </label>
//                     <p
//                       className="mt-0.5 text-xs"
//                       style={{ color: "var(--color-text-muted)" }}
//                     >
//                       Categorize the work on this card.
//                     </p>
//                   </div>

//                   <select
//                     id={`card-type-${listId}`}
//                     value={cardType}
//                     disabled={cardCreated || createCardMutation.isPending}
//                     onChange={(event) =>
//                       setCardType(event.target.value as TaskType)
//                     }
//                     className="h-11 w-full cursor-pointer rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
//                     style={{
//                       backgroundColor: "var(--color-input-bg)",
//                       borderColor: "var(--color-border)",
//                       color: "var(--color-text-primary)",
//                     }}
//                   >
//                     {taskTypes.map((item) => {
//                       return (
//                         <option
//                           key={item.value}
//                           value={item.value}
//                           style={{
//                             backgroundColor: "var(--color-card-bg)",
//                             color: "var(--color-text-primary)",
//                           }}
//                         >
//                           {item.label}
//                         </option>
//                       );
//                     })}
//                   </select>
//                 </section>

//                 {/* Description */}
//                 <section>
//                   <label
//                     className="mb-2 block text-sm font-semibold"
//                     style={{ color: "var(--color-text-primary)" }}
//                   >
//                     Description
//                   </label>
//                   <CardDescriptionEditor
//                     value={cardDescription}
//                     onChange={setCardDescription}
//                     toolbarAction={
//                       <label
//                         className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition hover:bg-black/5 dark:hover:bg-white/5 ${
//                           cardCreated || createCardMutation.isPending
//                             ? "pointer-events-none opacity-50"
//                             : ""
//                         }`}
//                         style={{ color: "var(--color-text-secondary)" }}
//                         title="Attach files"
//                       >
//                         <Paperclip size={15} />
//                         <input
//                           type="file"
//                           multiple
//                           disabled={cardCreated || createCardMutation.isPending}
//                           accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.zip,.docx,.xlsx"
//                           onChange={handleFileSelection}
//                           className="sr-only"
//                           aria-label="Attach files"
//                         />
//                       </label>
//                     }
//                     footer={
//                       <div>
//                         {selectedFiles.length > 0 && (
//                           <div className="mt-3 space-y-2">
//                             {selectedFiles.map((file, index) => {
//                               const isImage = file.type.startsWith("image/");
//                               const isPdf = file.type === "application/pdf";

//                               return (
//                                 <div
//                                   key={`${file.name}-${file.size}-${file.lastModified}`}
//                                   className="flex items-center gap-3 rounded-xl border p-3"
//                                   style={{
//                                     borderColor: "var(--color-border)",
//                                     backgroundColor: "var(--color-column-bg)",
//                                   }}
//                                 >
//                                   <span
//                                     className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
//                                     style={{
//                                       backgroundColor: "var(--color-card-bg)",
//                                       color: "var(--color-text-secondary)",
//                                     }}
//                                   >
//                                     {isImage ? (
//                                       <FileImage size={17} />
//                                     ) : isPdf ? (
//                                       <FileText size={17} />
//                                     ) : (
//                                       <File size={17} />
//                                     )}
//                                   </span>

//                                   <span className="min-w-0 flex-1">
//                                     <span
//                                       className="block truncate text-sm font-medium"
//                                       style={{
//                                         color: "var(--color-text-primary)",
//                                       }}
//                                     >
//                                       {file.name}
//                                     </span>
//                                     <span
//                                       className="mt-0.5 block text-xs"
//                                       style={{
//                                         color: "var(--color-text-muted)",
//                                       }}
//                                     >
//                                       {(file.size / 1024).toFixed(1)} KB
//                                     </span>
//                                   </span>

//                                   <button
//                                     type="button"
//                                     disabled={
//                                       cardCreated ||
//                                       createCardMutation.isPending
//                                     }
//                                     onClick={() =>
//                                       setSelectedFiles((files) =>
//                                         files.filter((_, i) => i !== index),
//                                       )
//                                     }
//                                     className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
//                                     style={{
//                                       color: "var(--color-text-muted)",
//                                     }}
//                                     aria-label={`Remove ${file.name}`}
//                                   >
//                                     <X size={15} />
//                                   </button>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         )}

//                         {fileError && (
//                           <p className="mt-2 text-xs text-red-500">
//                             {fileError}
//                           </p>
//                         )}

//                         <p
//                           className="mt-2 text-xs"
//                           style={{ color: "var(--color-text-muted)" }}
//                         >
//                           Images, PDFs, TXT, ZIP, DOCX or XLSX · max 4 MB each,
//                           up to 10 files
//                         </p>
//                       </div>
//                     }
//                   />
//                 </section>

//                 {/* Priority */}
//                 <section>
//                   <label
//                     htmlFor={`card-priority-${listId}`}
//                     className="mb-2 block text-sm font-semibold"
//                     style={{ color: "var(--color-text-primary)" }}
//                   >
//                     Priority
//                   </label>
//                   <select
//                     id={`card-priority-${listId}`}
//                     value={cardPriority}
//                     disabled={cardCreated || createCardMutation.isPending}
//                     onChange={(event) =>
//                       setCardPriority(event.target.value as CardPriority)
//                     }
//                     className="h-11 w-full cursor-pointer rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
//                     style={{
//                       backgroundColor: "var(--color-input-bg)",
//                       borderColor: "var(--color-border)",
//                       color: "var(--color-text-primary)",
//                     }}
//                   >
//                     {priorities.map((priority) => (
//                       <option
//                         key={priority}
//                         value={priority}
//                         style={{
//                           backgroundColor: "var(--color-card-bg)",
//                           color: "var(--color-text-primary)",
//                         }}
//                       >
//                         {capitalize(priority)}
//                       </option>
//                     ))}
//                   </select>
//                 </section>

//                 {/* Single date-range calendar */}
//                 <section>
//                   <div className="mb-2">
//                     <h3
//                       className="text-sm font-semibold"
//                       style={{ color: "var(--color-text-primary)" }}
//                     >
//                       Schedule
//                     </h3>
//                     <p
//                       className="mt-0.5 text-xs"
//                       style={{ color: "var(--color-text-muted)" }}
//                     >
//                       Select a start date, then select a due date in the same
//                       calendar.
//                     </p>
//                   </div>

//                   <button
//                     type="button"
//                     disabled={cardCreated || createCardMutation.isPending}
//                     onClick={() => setIsCalendarOpen((open) => !open)}
//                     className="flex w-full items-center gap-1 rounded-xl border p-2 text-left transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
//                     style={{
//                       borderColor: "var(--color-border)",
//                       color: "var(--color-text-primary)",
//                     }}
//                   >
//                     <span
//                       className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
//                       style={{
//                         backgroundColor: "var(--color-column-bg)",
//                         color: "var(--color-primary)",
//                       }}
//                     >
//                       <CalendarDays size={10} />
//                     </span>

//                     <span className="min-w-0 flex-1">
//                       <span className="block text-sm font-medium">
//                         {cardStartDate || cardEndDate
//                           ? `${formatDateLabel(cardStartDate)}${cardEndDate ? ` – ${formatDateLabel(cardEndDate)}` : " – Choose due date"}`
//                           : "Choose date range"}
//                       </span>
//                       <span
//                         className="mt-1 block text-xs"
//                         style={{ color: "var(--color-text-muted)" }}
//                       >
//                         {cardStartDate && cardEndDate
//                           ? "Start and due dates selected"
//                           : cardStartDate
//                             ? "Now choose the due date"
//                             : "Dates are optional"}
//                       </span>
//                     </span>

//                     <ChevronRight
//                       size={17}
//                       className={`transition ${isCalendarOpen ? "rotate-90" : ""}`}
//                     />
//                   </button>

//                   {isCalendarOpen && (
//                     <div
//                       className="mx-auto mt-3 w-full max-w-xs rounded-xl border p-3"
//                       style={{
//                         borderColor: "var(--color-border)",
//                         backgroundColor: "var(--color-card-bg)",
//                       }}
//                     >
//                       <div className="mb-3 flex items-center justify-between gap-3">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             setCalendarMonth(
//                               (month) =>
//                                 new Date(
//                                   month.getFullYear(),
//                                   month.getMonth() - 1,
//                                   1,
//                                 ),
//                             )
//                           }
//                           className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-black/5 dark:hover:bg-white/5"
//                           style={{
//                             borderColor: "var(--color-border)",
//                             color: "var(--color-text-secondary)",
//                           }}
//                           aria-label="Previous month"
//                         >
//                           <ChevronLeft size={17} />
//                         </button>

//                         <span
//                           className="text-sm font-semibold"
//                           style={{ color: "var(--color-text-primary)" }}
//                         >
//                           {calendarMonth.toLocaleDateString("en-US", {
//                             month: "long",
//                             year: "numeric",
//                           })}
//                         </span>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             setCalendarMonth(
//                               (month) =>
//                                 new Date(
//                                   month.getFullYear(),
//                                   month.getMonth() + 1,
//                                   1,
//                                 ),
//                             )
//                           }
//                           className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-black/5 dark:hover:bg-white/5"
//                           style={{
//                             borderColor: "var(--color-border)",
//                             color: "var(--color-text-secondary)",
//                           }}
//                           aria-label="Next month"
//                         >
//                           <ChevronRight size={17} />
//                         </button>
//                       </div>

//                       <div className="mb-2 grid grid-cols-7 gap-1">
//                         {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
//                           (day) => (
//                             <div
//                               key={day}
//                               className="py-1 text-center text-[11px] font-medium"
//                               style={{ color: "var(--color-text-muted)" }}
//                             >
//                               {day}
//                             </div>
//                           ),
//                         )}
//                       </div>

//                       <div className="grid grid-cols-7 gap-1">
//                         {Array.from({
//                           length: calendarMonth.getDay(),
//                         }).map((_, index) => (
//                           <div key={`empty-${index}`} />
//                         ))}

//                         {Array.from(
//                           {
//                             length: new Date(
//                               calendarMonth.getFullYear(),
//                               calendarMonth.getMonth() + 1,
//                               0,
//                             ).getDate(),
//                           },
//                           (_, index) =>
//                             new Date(
//                               calendarMonth.getFullYear(),
//                               calendarMonth.getMonth(),
//                               index + 1,
//                             ),
//                         ).map((date) => {
//                           const key = toDateKey(date);
//                           const isStart = key === cardStartDate;
//                           const isEnd = key === cardEndDate;
//                           const inRange =
//                             !!cardStartDate &&
//                             !!cardEndDate &&
//                             key > cardStartDate &&
//                             key < cardEndDate;
//                           const isToday = key === toDateKey(new Date());

//                           return (
//                             <button
//                               key={key}
//                               type="button"
//                               onClick={() => {
//                                 if (
//                                   !cardStartDate ||
//                                   (cardStartDate && cardEndDate)
//                                 ) {
//                                   setCardStartDate(key);
//                                   setCardEndDate("");
//                                 } else if (key < cardStartDate) {
//                                   setCardStartDate(key);
//                                   setCardEndDate("");
//                                 } else {
//                                   setCardEndDate(key);
//                                   setIsCalendarOpen(false);
//                                 }
//                               }}
//                               className="relative flex aspect-square items-center justify-center rounded-lg text-xs transition"
//                               style={{
//                                 backgroundColor:
//                                   isStart || isEnd
//                                     ? "var(--color-primary)"
//                                     : inRange
//                                       ? "var(--color-column-bg)"
//                                       : "transparent",
//                                 color:
//                                   isStart || isEnd
//                                     ? "#ffffff"
//                                     : "var(--color-text-primary)",
//                                 outline:
//                                   isToday && !isStart && !isEnd
//                                     ? "1px solid var(--color-primary)"
//                                     : "none",
//                                 fontWeight: isStart || isEnd ? 700 : 400,
//                               }}
//                               aria-label={`${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}${isStart ? ", start date" : isEnd ? ", due date" : ""}`}
//                             >
//                               {date.getDate()}
//                             </button>
//                           );
//                         })}
//                       </div>

//                       <div
//                         className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3"
//                         style={{ borderColor: "var(--color-border)" }}
//                       >
//                         <p
//                           className="text-xs"
//                           style={{ color: "var(--color-text-muted)" }}
//                         >
//                           {!cardStartDate
//                             ? "Choose your start date"
//                             : !cardEndDate
//                               ? "Choose your due date"
//                               : "Date range selected"}
//                         </p>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setCardStartDate("");
//                             setCardEndDate("");
//                           }}
//                           className="text-xs font-medium hover:underline"
//                           style={{ color: "var(--color-primary)" }}
//                         >
//                           Clear dates
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </section>

//                 {/* Sprint info */}
//                 <div
//                   className="flex items-start gap-2 rounded-xl border p-3"
//                   style={{
//                     backgroundColor: "var(--color-column-bg)",
//                     borderColor: "var(--color-border)",
//                   }}
//                 >
//                   <Check
//                     size={16}
//                     className="mt-0.5 shrink-0"
//                     style={{ color: "var(--color-primary)" }}
//                   />
//                   <p
//                     className="text-xs leading-5"
//                     style={{ color: "var(--color-text-secondary)" }}
//                   >
//                     {activeSprintId
//                       ? "This card will be added to the active sprint."
//                       : "No active sprint. This card will be created without a sprint."}
//                   </p>
//                 </div>

//                 {/* Errors */}
//                 {createCardMutation.isError && (
//                   <div
//                     className="rounded-xl border px-3 py-2.5 text-sm"
//                     style={{
//                       backgroundColor: "var(--color-tag-red-bg)",
//                       borderColor: "var(--color-tag-red-text)",
//                       color: "var(--color-tag-red-text)",
//                     }}
//                   >
//                     {createCardMutation.error instanceof Error
//                       ? createCardMutation.error.message
//                       : "Failed to create card."}
//                   </div>
//                 )}

//                 {attachmentError && (
//                   <div
//                     role="alert"
//                     className="rounded-xl border px-3 py-2.5 text-sm"
//                     style={{
//                       backgroundColor: "var(--color-tag-red-bg)",
//                       borderColor: "var(--color-tag-red-text)",
//                       color: "var(--color-tag-red-text)",
//                     }}
//                   >
//                     {attachmentError}
//                   </div>
//                 )}
//               </div>

//               {/* Footer */}
//               <div
//                 className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t px-5 py-4 sm:px-6"
//                 style={{
//                   backgroundColor: "var(--color-card-bg)",
//                   borderColor: "var(--color-border)",
//                 }}
//               >
//                 <button
//                   type="button"
//                   disabled={createCardMutation.isPending}
//                   onClick={closeCreateCardModal}
//                   className="rounded-[12px] border px-2 py-1.5 text-sm font-medium transition hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/5"
//                   style={{
//                     backgroundColor: "var(--color-card-bg)",
//                     borderColor: "var(--color-border)",
//                     color: "var(--color-text-secondary)",
//                   }}
//                 >
//                   {cardCreated ? "Close" : "Cancel"}
//                 </button>

//                 {!cardCreated && (
//                   <button
//                     type="button"
//                     disabled={createCardMutation.isPending || !cardTitle.trim()}
//                     onClick={handleCreateCard}
//                     className="flex items-center gap-2 rounded-[12px] px-2 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
//                     style={{ backgroundColor: "var(--color-primary)" }}
//                   >
//                     {createCardMutation.isPending ? (
//                       <>
//                         <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                         Creating card...
//                       </>
//                     ) : (
//                       <>
//                         <Plus size={16} />
//                         Create card
//                       </>
//                     )}
//                   </button>
//                 )}

//                 {cardCreated && (
//                   <span
//                     className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
//                     style={{
//                       backgroundColor: "var(--color-column-bg)",
//                       color: "var(--color-text-primary)",
//                     }}
//                   >
//                     <Check size={16} />
//                     Card created
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>,
//           document.body,
//         )}
//     </>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  File,
  FileImage,
  FileText,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import CardDescriptionEditor from "@/components/card/CardDescriptionEditor";
import CardDescriptionViewer from "./CardDescriptionViewer";
type CardPriority = "normal" | "show stopper" | "critical" | "major" | "minor";
type TaskType = "bug" | "feature" | "task" | "tbd";
type CardType = {
  id: string;
  boardId: string;
  boardListId: string;
  sprintId: string[];
  sprintName?: string | null;
  cardNumber: number;
  title: string;
  description: string | null;
  priority: CardPriority;
  type: TaskType;
  position: number;
  reporterId: string;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
type CardProps = {
  card?: CardType;
  workspaceId: string;
  boardId: string;
  listId: string;
  listName: string;
  sprintName?: string | null;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerAriaLabel?: string;
  triggerDisabled?: boolean;
  triggerIconSize?: number;
  activeSprintId?: string | null;
  onCreateClick?: () => void;
  onCardClick?: (cardId: string) => void;
};
type CreateCardPayload = {
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  priority: CardPriority;
  type: TaskType;
  sprintId: string[];
  sprintName?: string | null;
  listId: string;
  assigneeId: string | null;
};
type CreateCardVariables = {
  payload: CreateCardPayload;
  files: File[];
};
const priorities: CardPriority[] = [
  "normal",
  "show stopper",
  "critical",
  "major",
  "minor",
];
const taskTypes: { value: TaskType; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "feature", label: "Feature" },
  { value: "bug", label: "Bug" },
  { value: "tbd", label: "TBD" },
];
type BoardMemberApiResponse = {
  id?: string;
  userId?: string;
  name?: string;
  fullName?: string;
  email?: string;
  user?: {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
  };
};
// Keep in sync with the backend's file-size limit.
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_TOTAL_FILES = 10;
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
type Sprint = {
  id: string;
  name: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
};
function getPriorityColor(priority: CardPriority) {
  switch (priority) {
    case "normal":
      return "#3b82f6";
    case "show stopper":
      return "#a855f7";
    case "critical":
      return "#ef4444";
    case "major":
      return "#eab308";
    case "minor":
      return "#9ca3af";
    default:
      return "var(--color-border)";
  }
}
type BoardMember = {
  userId: string;
  name: string;
  email: string;
};
function formatCardDate(date: string | null) {
  if (!date) return "";
  const parsedDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatDateLabel(date: string) {
  if (!date) return "Select date";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
// function getCreatedCardId(data: any): string | undefined {
//   return data?.card?.id ?? data?.data?.card?.id ?? data?.data?.id ?? data?.id;
// }
type CreateCardResponse = {
  id?: string;
  card?: {
    id?: string;
  };
  data?: {
    id?: string;
    card?: {
      id?: string;
    };
  };
};
function getCreatedCardId(data: CreateCardResponse): string | undefined {
  return data?.card?.id ?? data?.data?.card?.id ?? data?.data?.id ?? data?.id;
}
export default function CreateCard({
  card,
  workspaceId,
  boardId,
  listId,
  listName,
  sprintName,
  triggerLabel = "Add card",
  triggerClassName,
  triggerAriaLabel,
  triggerDisabled = false,
  triggerIconSize = 16,
  activeSprintId = null,
  onCreateClick,
  onCardClick,
}: CardProps) {
  const queryClient = useQueryClient();
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [cardStartDate, setCardStartDate] = useState("");
  const [cardEndDate, setCardEndDate] = useState("");
  const [cardPriority, setCardPriority] = useState<CardPriority>("normal");
  const [cardType, setCardType] = useState<TaskType>("task");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [cardCreated, setCardCreated] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  /* sprint  */
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState(
    activeSprintId ?? "",
  );
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);
  const [sprintError, setSprintError] = useState("");
  /* assigned ticket to someone */
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState("");
  const createCardMutation = useMutation({
    mutationFn: async ({ payload, files }: CreateCardVariables) => {
      // 1. Create the card first.
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/card`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to create card.");
      }
      const newCardId = getCreatedCardId(data);
      if (!newCardId) {
        throw new Error(
          "The card may have been created, but the API response did not include its ID. Check the create-card response before retrying.",
        );
      }
      // 2. Upload files using the ID returned by the create-card API.
      const failedFiles: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const uploadResponse = await fetch(
            `/api/workspace/${workspaceId}/board/${boardId}/card/${newCardId}/attachment`,
            {
              method: "POST",
              body: formData,
            },
          );
          if (!uploadResponse.ok) {
            const uploadResult = await uploadResponse.json().catch(() => null);
            failedFiles.push(
              `${file.name}: ${uploadResult?.message ?? "Upload failed"}`,
            );
          }
        } catch {
          failedFiles.push(`${file.name}: Network error`);
        }
      }
      return {
        cardId: newCardId,
        failedFiles,
      };
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["board-cards", workspaceId, boardId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["board-cards", workspaceId, boardId, activeSprintId],
        }),
      ]);
      if (result.failedFiles.length > 0) {
        // The card exists. Do not allow another click to create a duplicate.
        setCardCreated(true);
        setAttachmentError(
          `Card created, but these attachments failed: ${result.failedFiles.join("; ")}. Close this form and retry the failed files from the card details.`,
        );
        return;
      }
      closeCreateCardModal();
    },
    onError: (error) => {
      console.error("CREATE_CARD_ERROR:", error);
    },
  });
  useEffect(() => {
    if (!isCreateCardOpen) return;
    const controller = new AbortController();
    async function fetchSprints() {
      setIsLoadingSprints(true);
      setSprintError("");
      try {
        const response = await fetch(
          `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
          { signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message ?? "Failed to load sprints.");
        }
        const sprintList: Sprint[] = Array.isArray(data)
          ? data
          : (data.sprints ?? data.data?.sprints ?? data.data ?? []);
        setSprints(sprintList);
        // Prefer the active sprint initially, if one exists.
        setSelectedSprintId((current) => {
          if (current && sprintList.some((s) => s.id === current)) {
            return current;
          }
          return sprintList.find((s) => s.status === "ACTIVE")?.id ?? "";
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setSprintError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSprints(false);
        }
      }
    }
    void fetchSprints();
    return () => controller.abort();
  }, [isCreateCardOpen, workspaceId, boardId, activeSprintId]);
  useEffect(() => {
    if (!isCreateCardOpen) return;
    const controller = new AbortController();
    async function fetchBoardMembers() {
      setIsLoadingMembers(true);
      setMemberError("");
      try {
        const response = await fetch(
          `/api/workspace/${workspaceId}/board/${boardId}/boardMembers?all=true`,
          { signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message ?? "Failed to load board members.");
        }
        // Adjust this mapping to your actual GET response.
        const members = Array.isArray(data)
          ? data
          : (data.members ?? data.data?.members ?? data.data ?? []);
        setBoardMembers(
          members
            .map((member: BoardMemberApiResponse) => ({
              userId: member.userId ?? member.user?.id ?? member.id,
              name:
                member.user?.name ??
                member.name ??
                member.user?.fullName ??
                member.fullName ??
                member.email ??
                "Unnamed member",
              email: member.user?.email ?? member.email ?? "",
            }))
            .filter((member: BoardMember) => member.userId),
        );
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setMemberError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingMembers(false);
        }
      }
    }
    void fetchBoardMembers();
    return () => controller.abort();
  }, [isCreateCardOpen, workspaceId, boardId]);
  const resetForm = () => {
    setCardTitle("");
    setCardDescription("");
    setCardStartDate("");
    setCardEndDate("");
    setCardPriority("normal");
    setCardType("task");
    setSelectedFiles([]);
    setFileError("");
    setAttachmentError("");
    setCardCreated(false);
    setIsCalendarOpen(false);
    setSelectedAssigneeId("");
  };
  const openCreateCardModal = () => {
    createCardMutation.reset();
    resetForm();
    setIsCreateCardOpen(true);
    onCreateClick?.();
  };
  const closeCreateCardModal = () => {
    if (createCardMutation.isPending) return;
    setIsCreateCardOpen(false);
    resetForm();
    createCardMutation.reset();
  };
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(event.target.files ?? []);
    setFileError("");
    setAttachmentError("");
    const nextFiles = [...selectedFiles];
    for (const file of incomingFiles) {
      if (!allowedTypes.has(file.type)) {
        setFileError(`${file.name}: This file type is not supported.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`${file.name}: Each file must be 4 MB or smaller.`);
        continue;
      }
      if (
        nextFiles.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified,
        )
      ) {
        continue;
      }
      if (nextFiles.length >= MAX_TOTAL_FILES) {
        setFileError(`You can attach up to ${MAX_TOTAL_FILES} files.`);
        break;
      }
      nextFiles.push(file);
    }
    setSelectedFiles(nextFiles);
    // Allow choosing the same file again after removing it.
    event.target.value = "";
  };
  const handleCreateCard = () => {
    const title = cardTitle.trim();
    if (!title || cardCreated || createCardMutation.isPending) return;
    if (cardStartDate && cardEndDate && cardEndDate < cardStartDate) {
      setFileError("");
      setAttachmentError("The due date must be on or after the start date.");
      return;
    }
    setAttachmentError("");
    createCardMutation.mutate({
      payload: {
        title,
        description: cardDescription.trim(),
        startDate: cardStartDate,
        dueDate: cardEndDate,
        priority: cardPriority,
        type: cardType,
        sprintId: selectedSprintId ? [selectedSprintId] : [],
        sprintName:
          sprints.find((sprint) => sprint.id === selectedSprintId)?.name ??
          null,
        listId,
        assigneeId: selectedAssigneeId || null,
      },
      files: [...selectedFiles],
    });
  };
  if (card) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onCardClick?.(card.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onCardClick?.(card.id);
          }
        }}
        className="group cursor-pointer rounded-lg border border-l-4 p-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
        style={{
          backgroundColor: "var(--color-card-bg)",
          borderColor: "var(--color-border)",
          borderLeftColor: getPriorityColor(card.priority),
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            {sprintName
              ? `${sprintName}_${card.cardNumber}`
              : `CARD-${card.cardNumber}`}
          </span>
          <div className="flex items-center gap-1.5">
            {card.type && (
              <span
                className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {capitalize(card.type)}
              </span>
            )}
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: "var(--color-column-bg)",
                color: "var(--color-text-secondary)",
              }}
            >
              {capitalize(card.priority)}
            </span>
          </div>
        </div>
        <p
          className="line-clamp-2 text-sm font-medium leading-5"
          style={{ color: "var(--color-text-primary)" }}
        >
          {card.title}
        </p>
        {/* {card.description && (
          <div
            className="mt-1 line-clamp-2 text-xs leading-4"
            style={{ color: "var(--color-text-muted)" }}
          >
            {card.description
              .replace(/<br\s*\/?\s*>/gi, " ")
              .replace(/<\/?(?:p|div|h[1-6]|li|tr)\b[^>]*>/gi, " ")
              .replace(/<[^>]*>/g, "")
              .replace(/&nbsp;/gi, " ")
              .replace(/&amp;/gi, "&")
              .replace(/&lt;/gi, "<")
              .replace(/&gt;/gi, ">")
              .replace(/&quot;/gi, '"')
              .replace(/&#39;/gi, "'")
              .replace(/\s+/g, " ")
              .trim()}
          </div>
        )} */}
        {card.description && (
          <CardDescriptionViewer
            content={card.description}
            variant="preview"
            className="mt-1"
          />
        )}
        {(card.startDate || card.dueDate) && (
          <div
            className="mt-3 flex items-center gap-1 text-[10px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            <CalendarDays size={12} />
            <span>
              {formatCardDate(card.startDate)}
              {card.dueDate ? ` → ${formatCardDate(card.dueDate)}` : ""}
            </span>
          </div>
        )}
      </div>
    );
  }
  return (
    <>
      <button
        type="button"
        disabled={triggerDisabled}
        aria-label={triggerAriaLabel}
        onClick={openCreateCardModal}
        className={
          triggerClassName ??
          "mx-2 mb-2 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
        }
        style={
          triggerClassName ? undefined : { color: "var(--color-text-muted)" }
        }
      >
        <Plus size={triggerIconSize} />
        <span>{triggerLabel}</span>
      </button>
      {isCreateCardOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-2 backdrop-blur-[2px] sm:p-5"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeCreateCardModal();
              }
            }}
          >
            <div
              className="flex h-[min(92dvh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
              style={{
                backgroundColor: "var(--color-card-bg)",
                borderColor: "var(--color-border)",
              }}
            >
              {/* Modal header */}
              <div
                className="z-10 flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-8"
                style={{
                  backgroundColor: "var(--color-card-bg)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: "var(--color-column-bg)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <Plus size={18} />
                    </span>
                    <div>
                      <h2
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Create ticket
                      </h2>
                      <p
                        className="mt-0.5 text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Describe the work and assign the details.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span style={{ color: "var(--color-text-muted)" }}>
                      Adding to
                    </span>
                    <span
                      className="rounded-md border px-2 py-1 font-medium"
                      style={{
                        backgroundColor: "var(--color-column-bg)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {listName}
                    </span>
                    <p
                      className="text-xs leading-5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {selectedSprintId
                        ? `This card will be added to ${
                            sprints.find(
                              (sprint) => sprint.id === selectedSprintId,
                            )?.name ?? "the selected sprint"
                          }.`
                        : "This card will be created without a sprint."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={createCardMutation.isPending}
                  onClick={closeCreateCardModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/5"
                  style={{ color: "var(--color-text-muted)" }}
                  aria-label="Close create card form"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_385px] lg:overflow-hidden">
                {/* Main ticket content: title, rich editor and attachments */}
                <main className="card-scroll min-w-0 space-y-7 overflow-y-visible px-5 py-6 sm:px-8 lg:overflow-y-auto lg:px-10">
                  {/* Title */}
                  <section>
                    <label
                      htmlFor={`card-title-${listId}`}
                      className="mb-2 block text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Summary <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`card-title-${listId}`}
                      type="text"
                      value={cardTitle}
                      onChange={(event) => setCardTitle(event.target.value)}
                      placeholder="What needs to be done?"
                      autoFocus
                      disabled={cardCreated || createCardMutation.isPending}
                      className="h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/20"
                      style={{
                        backgroundColor: "var(--color-input-bg)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                  </section>
                  {/* Description */}
                  <section>
                    <label
                      className="mb-2 block text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Description
                    </label>
                    <CardDescriptionEditor
                      value={cardDescription}
                      onChange={setCardDescription}
                      toolbarAction={
                        <label
                          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition hover:bg-black/5 dark:hover:bg-white/5 ${
                            cardCreated || createCardMutation.isPending
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                          style={{ color: "var(--color-text-secondary)" }}
                          title="Attach files"
                        >
                          <Paperclip size={15} />
                          <input
                            type="file"
                            multiple
                            disabled={
                              cardCreated || createCardMutation.isPending
                            }
                            accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.zip,.docx,.xlsx"
                            onChange={handleFileSelection}
                            className="sr-only"
                            aria-label="Attach files"
                          />
                        </label>
                      }
                      footer={
                        <div>
                          {selectedFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {selectedFiles.map((file, index) => {
                                const isImage = file.type.startsWith("image/");
                                const isPdf = file.type === "application/pdf";
                                return (
                                  <div
                                    key={`${file.name}-${file.size}-${file.lastModified}`}
                                    className="flex items-center gap-3 rounded-xl border p-3"
                                    style={{
                                      borderColor: "var(--color-border)",
                                      backgroundColor: "var(--color-column-bg)",
                                    }}
                                  >
                                    <span
                                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                      style={{
                                        backgroundColor: "var(--color-card-bg)",
                                        color: "var(--color-text-secondary)",
                                      }}
                                    >
                                      {isImage ? (
                                        <FileImage size={17} />
                                      ) : isPdf ? (
                                        <FileText size={17} />
                                      ) : (
                                        <File size={17} />
                                      )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span
                                        className="block truncate text-sm font-medium"
                                        style={{
                                          color: "var(--color-text-primary)",
                                        }}
                                      >
                                        {file.name}
                                      </span>
                                      <span
                                        className="mt-0.5 block text-xs"
                                        style={{
                                          color: "var(--color-text-muted)",
                                        }}
                                      >
                                        {(file.size / 1024).toFixed(1)} KB
                                      </span>
                                    </span>
                                    <button
                                      type="button"
                                      disabled={
                                        cardCreated ||
                                        createCardMutation.isPending
                                      }
                                      onClick={() =>
                                        setSelectedFiles((files) =>
                                          files.filter((_, i) => i !== index),
                                        )
                                      }
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                                      style={{
                                        color: "var(--color-text-muted)",
                                      }}
                                      aria-label={`Remove ${file.name}`}
                                    >
                                      <X size={15} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {fileError && (
                            <p className="mt-2 text-xs text-red-500">
                              {fileError}
                            </p>
                          )}
                          <p
                            className="mt-2 text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            Images, PDFs, TXT, ZIP, DOCX or XLSX · max 4 MB
                            each, up to 10 files
                          </p>
                        </div>
                      }
                    />
                  </section>
                </main>
                {/* Jira-like right side details panel */}
                <aside
                  aria-label="Ticket details"
                  className="card-scroll min-w-0 space-y-5 border-t px-5 py-6 sm:px-7 lg:overflow-y-auto lg:border-l lg:border-t-0"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-column-bg)",
                  }}
                >
                  <div
                    className="flex items-center justify-between gap-3 border-b pb-3"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Details
                    </h3>
                    <span
                      className="rounded-md border px-2 py-1 text-xs"
                      style={{
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {listName}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
                      <label
                        htmlFor={`card-type-${listId}`}
                        className="text-xs font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Type
                      </label>
                      <div className="min-w-0">
                        <select
                          id={`card-type-${listId}`}
                          value={cardType}
                          disabled={cardCreated || createCardMutation.isPending}
                          onChange={(event) =>
                            setCardType(event.target.value as TaskType)
                          }
                          className="h-9 min-w-0 w-full cursor-pointer rounded-md border px-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                          style={{
                            backgroundColor: "var(--color-input-bg)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {taskTypes.map((item) => {
                            return (
                              <option
                                key={item.value}
                                value={item.value}
                                style={{
                                  backgroundColor: "var(--color-card-bg)",
                                  color: "var(--color-text-primary)",
                                }}
                              >
                                {item.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
                      <label
                        htmlFor={`card-priority-${listId}`}
                        className="text-xs font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Priority
                      </label>
                      <div className="min-w-0">
                        <select
                          id={`card-priority-${listId}`}
                          value={cardPriority}
                          disabled={cardCreated || createCardMutation.isPending}
                          onChange={(event) =>
                            setCardPriority(event.target.value as CardPriority)
                          }
                          className="h-9 min-w-0 w-full cursor-pointer rounded-md border px-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                          style={{
                            backgroundColor: "var(--color-input-bg)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {priorities.map((priority) => (
                            <option
                              key={priority}
                              value={priority}
                              style={{
                                backgroundColor: "var(--color-card-bg)",
                                color: "var(--color-text-primary)",
                              }}
                            >
                              {capitalize(priority)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
                      <label
                        htmlFor={`card-assignee-${listId}`}
                        className="text-xs font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Assignee
                      </label>
                      <div className="min-w-0">
                        <select
                          id={`card-assignee-${listId}`}
                          value={selectedAssigneeId}
                          onChange={(event) =>
                            setSelectedAssigneeId(event.target.value)
                          }
                          disabled={
                            isLoadingMembers ||
                            cardCreated ||
                            createCardMutation.isPending
                          }
                          className="h-9 min-w-0 w-full cursor-pointer rounded-md border px-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                          style={{
                            backgroundColor: "var(--color-input-bg)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          <option
                            value=""
                            style={{
                              backgroundColor: "var(--color-card-bg)",
                              color: "var(--color-text-primary)",
                            }}
                          >
                            Unassigned
                          </option>
                          {boardMembers.map((member) => (
                            <option
                              key={member.userId}
                              value={member.userId}
                              style={{
                                backgroundColor: "var(--color-card-bg)",
                                color: "var(--color-text-primary)",
                              }}
                            >
                              {member.name}
                              {member.email ? ` (${member.email})` : ""}
                            </option>
                          ))}
                        </select>
                        {isLoadingMembers && (
                          <p
                            className="mt-1 text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            Loading members...
                          </p>
                        )}
                        {memberError && (
                          <p className="mt-1 text-xs text-red-500">
                            {memberError}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
                      <label
                        htmlFor={`card-sprint-${listId}`}
                        className="text-xs font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Sprint
                      </label>
                      <div className="min-w-0">
                        <select
                          id={`card-sprint-${listId}`}
                          value={selectedSprintId}
                          disabled={
                            isLoadingSprints ||
                            cardCreated ||
                            createCardMutation.isPending
                          }
                          onChange={(event) =>
                            setSelectedSprintId(event.target.value)
                          }
                          className="h-9 min-w-0 w-full cursor-pointer rounded-md border px-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                          style={{
                            backgroundColor: "var(--color-input-bg)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          <option
                            value=""
                            style={{
                              backgroundColor: "var(--color-card-bg)",
                              color: "var(--color-text-primary)",
                            }}
                          >
                            No sprint
                          </option>
                          {sprints.map((sprint) => (
                            <option
                              key={sprint.id}
                              value={sprint.id}
                              style={{
                                backgroundColor: "var(--color-card-bg)",
                                color: "var(--color-text-primary)",
                              }}
                            >
                              {sprint.name} ({sprint.status})
                            </option>
                          ))}
                        </select>
                        {sprintError && (
                          <p className="mt-1 text-xs text-red-500">
                            {sprintError}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Schedule
                      </span>
                      <button
                        type="button"
                        disabled={cardCreated || createCardMutation.isPending}
                        onClick={() => setIsCalendarOpen((open) => !open)}
                        className="flex min-h-9 min-w-0 w-full items-center justify-between gap-2 rounded-md border px-2 text-left text-sm transition hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                        style={{
                          borderColor: "var(--color-border)",
                          backgroundColor: "var(--color-input-bg)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        <span className="min-w-0 truncate">
                          {cardStartDate || cardEndDate
                            ? `${formatDateLabel(cardStartDate)}${cardEndDate ? ` – ${formatDateLabel(cardEndDate)}` : " – Choose due"}`
                            : "Set dates"}
                        </span>
                        <CalendarDays size={15} className="shrink-0" />
                      </button>
                    </div>
                    <div className="min-w-0">
                      {" "}
                      {isCalendarOpen && (
                        <div
                          className="mx-auto mt-3 w-full max-w-xs rounded-xl border p-3"
                          style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-card-bg)",
                          }}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setCalendarMonth(
                                  (month) =>
                                    new Date(
                                      month.getFullYear(),
                                      month.getMonth() - 1,
                                      1,
                                    ),
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-black/5 dark:hover:bg-white/5"
                              style={{
                                borderColor: "var(--color-border)",
                                color: "var(--color-text-secondary)",
                              }}
                              aria-label="Previous month"
                            >
                              <ChevronLeft size={17} />
                            </button>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "var(--color-text-primary)" }}
                            >
                              {calendarMonth.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setCalendarMonth(
                                  (month) =>
                                    new Date(
                                      month.getFullYear(),
                                      month.getMonth() + 1,
                                      1,
                                    ),
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-black/5 dark:hover:bg-white/5"
                              style={{
                                borderColor: "var(--color-border)",
                                color: "var(--color-text-secondary)",
                              }}
                              aria-label="Next month"
                            >
                              <ChevronRight size={17} />
                            </button>
                          </div>
                          <div className="mb-2 grid grid-cols-7 gap-1">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                              (day) => (
                                <div
                                  key={day}
                                  className="py-1 text-center text-[11px] font-medium"
                                  style={{ color: "var(--color-text-muted)" }}
                                >
                                  {day}
                                </div>
                              ),
                            )}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({
                              length: calendarMonth.getDay(),
                            }).map((_, index) => (
                              <div key={`empty-${index}`} />
                            ))}
                            {Array.from(
                              {
                                length: new Date(
                                  calendarMonth.getFullYear(),
                                  calendarMonth.getMonth() + 1,
                                  0,
                                ).getDate(),
                              },
                              (_, index) =>
                                new Date(
                                  calendarMonth.getFullYear(),
                                  calendarMonth.getMonth(),
                                  index + 1,
                                ),
                            ).map((date) => {
                              const key = toDateKey(date);
                              const isStart = key === cardStartDate;
                              const isEnd = key === cardEndDate;
                              const inRange =
                                !!cardStartDate &&
                                !!cardEndDate &&
                                key > cardStartDate &&
                                key < cardEndDate;
                              const isToday = key === toDateKey(new Date());
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    if (
                                      !cardStartDate ||
                                      (cardStartDate && cardEndDate)
                                    ) {
                                      setCardStartDate(key);
                                      setCardEndDate("");
                                    } else if (key < cardStartDate) {
                                      setCardStartDate(key);
                                      setCardEndDate("");
                                    } else {
                                      setCardEndDate(key);
                                      setIsCalendarOpen(false);
                                    }
                                  }}
                                  className="relative flex aspect-square items-center justify-center rounded-lg text-xs transition"
                                  style={{
                                    backgroundColor:
                                      isStart || isEnd
                                        ? "var(--color-primary)"
                                        : inRange
                                          ? "var(--color-column-bg)"
                                          : "transparent",
                                    color:
                                      isStart || isEnd
                                        ? "#ffffff"
                                        : "var(--color-text-primary)",
                                    outline:
                                      isToday && !isStart && !isEnd
                                        ? "1px solid var(--color-primary)"
                                        : "none",
                                    fontWeight: isStart || isEnd ? 700 : 400,
                                  }}
                                  aria-label={`${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}${isStart ? ", start date" : isEnd ? ", due date" : ""}`}
                                >
                                  {date.getDate()}
                                </button>
                              );
                            })}
                          </div>
                          <div
                            className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3"
                            style={{ borderColor: "var(--color-border)" }}
                          >
                            <p
                              className="text-xs"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              {!cardStartDate
                                ? "Choose your start date"
                                : !cardEndDate
                                  ? "Choose your due date"
                                  : "Date range selected"}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setCardStartDate("");
                                setCardEndDate("");
                              }}
                              className="text-xs font-medium hover:underline"
                              style={{ color: "var(--color-primary)" }}
                            >
                              Clear dates
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
              <div className="space-y-2 px-5 py-2 sm:px-8" aria-live="polite">
                {/* Errors */}
                {createCardMutation.isError && (
                  <div
                    className="rounded-xl border px-3 py-2.5 text-sm"
                    style={{
                      backgroundColor: "var(--color-tag-red-bg)",
                      borderColor: "var(--color-tag-red-text)",
                      color: "var(--color-tag-red-text)",
                    }}
                  >
                    {createCardMutation.error instanceof Error
                      ? createCardMutation.error.message
                      : "Failed to create card."}
                  </div>
                )}
                {attachmentError && (
                  <div
                    role="alert"
                    className="rounded-xl border px-3 py-2.5 text-sm"
                    style={{
                      backgroundColor: "var(--color-tag-red-bg)",
                      borderColor: "var(--color-tag-red-text)",
                      color: "var(--color-tag-red-text)",
                    }}
                  >
                    {attachmentError}
                  </div>
                )}
              </div>
              {/* Footer */}
              <div
                className="flex shrink-0 flex-wrap justify-end gap-2 border-t px-5 py-4 sm:px-8"
                style={{
                  backgroundColor: "var(--color-card-bg)",
                  borderColor: "var(--color-border)",
                }}
              >
                <button
                  type="button"
                  disabled={createCardMutation.isPending}
                  onClick={closeCreateCardModal}
                  className="rounded-[12px] border px-2 py-1.5 text-sm font-medium transition hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/5"
                  style={{
                    backgroundColor: "var(--color-card-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {cardCreated ? "Close" : "Cancel"}
                </button>
                {!cardCreated && (
                  <button
                    type="button"
                    disabled={createCardMutation.isPending || !cardTitle.trim()}
                    onClick={handleCreateCard}
                    className="flex items-center gap-2 rounded-[12px] px-2 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {createCardMutation.isPending ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Creating ticket...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create ticket
                      </>
                    )}
                  </button>
                )}
                {cardCreated && (
                  <span
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                    style={{
                      backgroundColor: "var(--color-column-bg)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    <Check size={16} />
                    Ticket created
                  </span>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
