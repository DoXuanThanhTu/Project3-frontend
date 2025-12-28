// "use client";
// import React, { useEffect, useState } from "react";
// import { Episode, Server } from "@repo/types";
// import { Play } from "lucide-react";
// import { Button } from "@repo/ui/button";

// interface Props {
//   servers: (Server & { episodes?: Episode[] })[];
//   currentEpisodeId?: string;
//   onSelectEpisode: (ep: Episode, server: Server) => void;
//   playerRef: React.RefObject<HTMLDivElement | null>; // ✅ cho phép null
// }

// export default function EpisodesByServer({
//   servers,
//   currentEpisodeId,
//   onSelectEpisode,
//   playerRef,
// }: Props) {
//   const [activeServer, setActiveServer] = useState<
//     (Server & { episodes?: Episode[] }) | null
//   >(null);
//   const [compactMode, setCompactMode] = useState(true);

//   useEffect(() => {
//     if (servers?.length) setActiveServer(servers[0] ?? null);
//   }, [servers]);

//   // ✅ Xử lý chọn tập và scroll tới player
//   const handleSelect = (ep: Episode, server: Server) => {
//     onSelectEpisode(ep, server);
//     playerRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   if (!servers?.length)
//     return (
//       <div className="mt-6 text-center text-gray-400 text-sm">
//         Không có Server nào để hiển thị.
//       </div>
//     );

//   return (
//     <div className="mt-6 space-y-4">
//       {/* Thanh chọn server + toggle chế độ */}
//       <div className="flex justify-between items-center flex-wrap gap-3">
//         <div className="flex flex-wrap gap-2">
//           {servers.map((server) => (
//             <Button
//               key={server._id}
//               variant={activeServer?._id === server._id ? "default" : "outline"}
//               onClick={() => setActiveServer(server)}
//             >
//               {server.name}
//             </Button>
//           ))}
//         </div>

//         {/* Toggle rút gọn */}
//         <div
//           className="flex items-center gap-3 cursor-pointer select-none group"
//           onClick={() => setCompactMode((p) => !p)}
//         >
//           <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
//             Rút gọn
//           </span>

//           <div
//             className={`relative w-10 h-5 flex items-center rounded-full transition-colors duration-300 ${
//               compactMode ? "bg-yellow-500" : "bg-gray-600"
//             }`}
//           >
//             <span
//               className={`absolute left-0 top-0 h-5 w-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-out ${
//                 compactMode ? "translate-x-5" : "translate-x-0"
//               }`}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Danh sách tập */}
//       {activeServer?.episodes && (
//         <div
//           className={`grid gap-3 ${
//             compactMode
//               ? "grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10"
//               : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6"
//           }`}
//         >
//           {activeServer.episodes.map((ep) => {
//             const isActive = currentEpisodeId === ep._id;

//             if (compactMode) {
//               return (
//                 <button
//                   key={ep._id}
//                   onClick={() => handleSelect(ep, activeServer)}
//                   className={`px-3 py-2 rounded-md border text-sm transition-all flex items-center gap-1 justify-center ${
//                     isActive
//                       ? "bg-yellow-500 text-black border-yellow-600"
//                       : "bg-gray-800 text-gray-200 hover:bg-gray-700"
//                   }`}
//                 >
//                   <Play size={14} />
//                   Tập {ep.episode_number}
//                 </button>
//               );
//             }

//             return (
//               <div
//                 key={ep._id}
//                 onClick={() => handleSelect(ep, activeServer)}
//                 className={`cursor-pointer group relative rounded-lg overflow-hidden transition-all duration-200 ${
//                   isActive ? "ring-2 ring-yellow-500" : ""
//                 }`}
//               >
//                 <div className="aspect-video bg-gray-800 overflow-hidden">
//                   <img
//                     src={ep.thumbnail_url || "/no_thumb.png"}
//                     alt={`Tập ${ep.episode_number}`}
//                     className="w-full h-full object-cover group-hover:scale-105 transition-transform"
//                   />
//                 </div>

//                 {isActive && (
//                   <span className="absolute bottom-7 left-0 bg-yellow-500 text-black text-xs px-2 py-0.5">
//                     Đang chiếu
//                   </span>
//                 )}

//                 <div className="mt-2 text-sm text-gray-200 font-medium">
//                   {`Tập ${ep.episode_number}`}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
