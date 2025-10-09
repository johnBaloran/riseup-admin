// // src/components/common/Pagination.tsx
// "use client";

// import {
//   Pagination as ShadcnPagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
//   PaginationEllipsis,
// } from "@/components/ui/pagination";

// interface PaginationProps {
//   currentPage: number;
//   totalPages: number;
//   total: number;
//   limit?: number;
//   onPageChange: (page: number) => void;
//   label?: string; // e.g., "players", "divisions"
// }

// export function Pagination({
//   currentPage,
//   totalPages,
//   total,
//   limit = 12,
//   onPageChange,
//   label = "items",
// }: PaginationProps) {
//   if (totalPages <= 1) return null;

//   const startIndex = (currentPage - 1) * limit;
//   const endIndex = Math.min(currentPage * limit, total);

//   const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

//   return (
//     <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow p-4">
//       {/* Showing X-Y of Z */}
//       <div className="text-sm text-gray-600">
//         Showing {startIndex + 1} to {endIndex} of {total} {label}
//       </div>

//       {/* Pagination Buttons */}
//       <ShadcnPagination>
//         <PaginationContent className="flex gap-2">
//           {/* Previous */}
//           <PaginationItem>
//             <PaginationPrevious
//               onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
//               aria-disabled={currentPage === 1}
//               className={
//                 currentPage === 1 ? "pointer-events-none opacity-50" : ""
//               }
//             >
//               Previous
//             </PaginationPrevious>
//           </PaginationItem>

//           {/* Page numbers */}
//           {pages.map((page) => {
//             if (
//               page === 1 ||
//               page === totalPages ||
//               (page >= currentPage - 1 && page <= currentPage + 1)
//             ) {
//               return (
//                 <PaginationItem key={page}>
//                   <PaginationLink
//                     isActive={currentPage === page}
//                     onClick={() => onPageChange(page)}
//                   >
//                     {page}
//                   </PaginationLink>
//                 </PaginationItem>
//               );
//             } else if (page === currentPage - 2 || page === currentPage + 2) {
//               return <PaginationEllipsis key={page} />;
//             }
//             return null;
//           })}

//           {/* Next */}
//           <PaginationItem>
//             <PaginationNext
//               onClick={() => onPageChange(currentPage + 1)}
//               aria-disabled={currentPage === totalPages}
//               className={
//                 currentPage === 1 ? "pointer-events-none opacity-50" : ""
//               }
//             >
//               Next
//             </PaginationNext>
//           </PaginationItem>
//         </PaginationContent>
//       </ShadcnPagination>
//     </div>
//   );
// }

// src/components/common/Pagination.tsx
"use client";

import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit?: number;
  onPageChange: (page: number) => void;
  label?: string; // e.g., "players", "divisions"
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  limit = 12,
  onPageChange,
  label = "items",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(currentPage * limit, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Debug info
  console.log("[Pagination] currentPage:", currentPage);
  console.log("[Pagination] totalPages:", totalPages);
  console.log("[Pagination] startIndex:", startIndex);
  console.log("[Pagination] endIndex:", endIndex);
  console.log("[Pagination] total items:", total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow p-4">
      {/* Showing X-Y of Z */}
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1} to {endIndex} of {total} {label}
      </div>

      {/* Pagination Buttons */}
      <ShadcnPagination>
        <PaginationContent className="flex gap-2">
          {/* Previous */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                console.log("[Pagination] Previous clicked");
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              aria-disabled={currentPage === 1}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            >
              Previous
            </PaginationPrevious>
          </PaginationItem>

          {/* Page numbers */}
          {pages.map((page) => {
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => {
                      console.log(`[Pagination] Page ${page} clicked`);
                      onPageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <PaginationEllipsis key={page} />;
            }
            return null;
          })}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              onClick={() => {
                console.log("[Pagination] Next clicked");
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              aria-disabled={currentPage === totalPages}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            >
              Next
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </ShadcnPagination>
    </div>
  );
}
