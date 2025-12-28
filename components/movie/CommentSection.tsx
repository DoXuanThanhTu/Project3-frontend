"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaReply,
  FaUserCircle,
} from "react-icons/fa";
import CommentSkeleton from "../skeleton/Comment";
// ========== MOCK DATA ==========
const MOCK_COMMENTS: Comment[] = [
  {
    _id: "c1",
    content: "Phim này xem cuốn thật sự 😍",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    likes: ["u1", "u2"],
    dislikes: [],
    user_id: {
      id: "u1",
      username: "Thanh",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    replies: [
      {
        _id: "c1-r1",
        content: "Đúng rồi, đoạn cuối rất đã 🔥",
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        likes: ["u2"],
        dislikes: [],
        user_id: {
          id: "u2",
          username: "Minh",
          avatar: "https://i.pravatar.cc/150?img=5",
        },
      },
    ],
  },
  {
    _id: "c2",
    content: "Mình thấy nội dung hơi chậm 🤔",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: [],
    dislikes: ["u1"],
    user_id: {
      id: "u3",
      username: "Huy",
    },
    replies: [],
  },
];

// ========== FAKE FETCH (2s) ==========
const fakeFetchComments = (
  page: number,
  limit: number
): Promise<{
  items: Comment[];
  total: number;
  page: number;
  limit: number;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * limit;
      const end = start + limit;

      resolve({
        items: MOCK_COMMENTS.slice(start, end),
        total: MOCK_COMMENTS.length,
        page,
        limit,
      });
    }, 1000); // ⏳ giả lập 2s
  });
};

const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL;

// ========== TYPES ==========
interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  content: string;
  user_id?: User;
  likes?: string[];
  dislikes?: string[];
  createdAt: string;
  movie_id?: string;
  parent_id?: string;
  replies?: Comment[];
  depth?: number;
}

interface CommentSectionProps {
  movieId?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ========== UTILS ==========
const getTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
};

const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ========== COMPONENTS ==========
interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  onReply: (commentId: string) => void;
  isAuthenticated: boolean;
  currentUserId?: string;
}

const CommentItem: React.FC<CommentItemProps> = React.memo(
  ({ comment, onLike, onDislike, onReply, isAuthenticated, currentUserId }) => {
    const {
      _id,
      user_id,
      content,
      createdAt,
      likes = [],
      dislikes = [],
      replies = [],
      depth = 0,
    } = comment;

    const isLiked = currentUserId ? likes.includes(currentUserId) : false;
    const isDisliked = currentUserId ? dislikes.includes(currentUserId) : false;

    return (
      <div
        className={`flex gap-3 py-3 ${
          depth > 0 ? "ml-6 md:ml-8 pl-4 border-l border-gray-700" : ""
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user_id?.avatar ? (
            <img
              src={user_id.avatar}
              alt={user_id.username}
              className={`rounded-full object-cover ${
                depth > 0 ? "w-6 h-6 md:w-8 md:h-8" : "w-8 h-8 md:w-10 md:h-10"
              }`}
              loading="lazy"
            />
          ) : (
            <FaUserCircle
              className={`text-gray-500 ${depth > 0 ? "text-xl" : "text-2xl"}`}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <span className="font-semibold text-white text-sm md:text-base">
              {user_id?.username || "Ẩn danh"}
            </span>
            <span className="text-gray-400 text-xs md:text-sm">
              {formatDate(createdAt)}
            </span>
          </div>

          {/* Comment Text */}
          <p className="text-gray-100 text-sm md:text-base break-words whitespace-pre-wrap">
            {content}
          </p>

          {/* Actions */}
          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <button
              onClick={() => onLike(_id)}
              className={`flex items-center gap-1 transition ${
                isLiked ? "text-blue-500" : "hover:text-blue-500"
              }`}
              disabled={!isAuthenticated}
              title={isAuthenticated ? "Thích" : "Đăng nhập để thích"}
            >
              <FaThumbsUp className={isLiked ? "fill-blue-500" : ""} />
              <span>{likes.length}</span>
            </button>

            <button
              onClick={() => onDislike(_id)}
              className={`flex items-center gap-1 transition ${
                isDisliked ? "text-red-500" : "hover:text-red-500"
              }`}
              disabled={!isAuthenticated}
              title={
                isAuthenticated ? "Không thích" : "Đăng nhập để không thích"
              }
            >
              <FaThumbsDown className={isDisliked ? "fill-red-500" : ""} />
              <span>{dislikes.length}</span>
            </button>

            {depth < 2 && isAuthenticated && (
              <button
                onClick={() => onReply(_id)}
                className="flex items-center gap-1 hover:text-green-500 transition"
                title="Trả lời"
              >
                <FaReply />
                <span className="hidden sm:inline">Trả lời</span>
              </button>
            )}
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-4">
              {replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={{ ...reply, depth: (depth || 0) + 1 }}
                  onLike={onLike}
                  onDislike={onDislike}
                  onReply={onReply}
                  isAuthenticated={isAuthenticated}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CommentItem.displayName = "CommentItem";

// ========== MAIN COMPONENT ==========
export default function CommentSection({ movieId }: CommentSectionProps) {
  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Derived state
  const token = getTokenFromCookie();
  const currentUser = getCurrentUser();
  const isAuthenticated = !!token;

  // Memoized values
  const flattenedComments = useMemo(() => {
    const flattenReplies = (commentList: Comment[]): Comment[] => {
      return commentList.reduce<Comment[]>((acc, comment) => {
        acc.push(comment);
        if (comment.replies && comment.replies.length > 0) {
          acc.push(...flattenReplies(comment.replies));
        }
        return acc;
      }, []);
    };
    return flattenReplies(comments);
  }, [comments]);

  // API Calls
  // const fetchComments = useCallback(
  //   async (page = 1) => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const params = new URLSearchParams({
  //         page: page.toString(),
  //         limit: pagination.limit.toString(),
  //         ...(movieId && { movie_id: movieId }),
  //       });

  //       const res = await axios.get(`${USER_API_URL}/comments?${params}`);
  //       const { items, total, page: currentPage, limit } = res.data.data;

  //       setComments(items || []);
  //       setPagination({
  //         page: currentPage || page,
  //         limit,
  //         total: total || 0,
  //         totalPages: Math.ceil((total || 0) / limit),
  //       });
  //     } catch (err) {
  //       console.error("Lỗi khi tải bình luận:", err);
  //       setError("Không thể tải bình luận. Vui lòng thử lại sau.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [movieId, pagination.limit]
  // );
  const fetchComments = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fakeFetchComments(page, pagination.limit);

        setComments(res.items);
        setPagination({
          page: res.page,
          limit: res.limit,
          total: res.total,
          totalPages: Math.ceil(res.total / res.limit),
        });
      } catch (err) {
        console.error("Mock fetch error:", err);
        setError("Không thể tải bình luận (mock)");
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  // Effects
  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  // Handlers
  const handleSubmit = async (parentId?: string, content?: string) => {
    if (!isAuthenticated) {
      alert("Bạn cần đăng nhập để bình luận!");
      return;
    }

    const commentContent = content?.trim() || newComment.trim();
    if (!commentContent) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload: any = { content: commentContent };
      if (movieId) payload.movie_id = movieId;
      if (parentId) payload.parent_id = parentId;

      await axios.post(`${USER_API_URL}/comments`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh comments
      await fetchComments(pagination.page);

      if (!parentId) setNewComment("");
    } catch (err) {
      console.error("Lỗi khi gửi bình luận:", err);
      setError("Gửi bình luận thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeDislike = async (
    commentId: string,
    type: "like" | "dislike"
  ) => {
    if (!isAuthenticated) {
      alert("Bạn cần đăng nhập để thực hiện thao tác này!");
      return;
    }

    const userId = currentUser?.id;
    if (!userId) return;

    // Optimistic update
    const updateComment = (list: Comment[]): Comment[] =>
      list.map((comment) => {
        if (comment._id === commentId) {
          const likes = [...(comment.likes || [])];
          const dislikes = [...(comment.dislikes || [])];

          if (type === "like") {
            if (likes.includes(userId)) {
              likes.splice(likes.indexOf(userId), 1);
            } else {
              likes.push(userId);
              const dislikeIndex = dislikes.indexOf(userId);
              if (dislikeIndex > -1) {
                dislikes.splice(dislikeIndex, 1);
              }
            }
          } else {
            if (dislikes.includes(userId)) {
              dislikes.splice(dislikes.indexOf(userId), 1);
            } else {
              dislikes.push(userId);
              const likeIndex = likes.indexOf(userId);
              if (likeIndex > -1) {
                likes.splice(likeIndex, 1);
              }
            }
          }

          return { ...comment, likes, dislikes };
        }

        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: updateComment(comment.replies) };
        }

        return comment;
      });

    const oldComments = [...comments];
    setComments((prev) => updateComment(prev));

    try {
      await axios.post(
        `${USER_API_URL}/comments/${commentId}/${type}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(`Lỗi khi ${type} comment:`, err);
      // Rollback on error
      setComments(oldComments);
    }
  };

  const handleReply = (commentId: string) => {
    const replyContent = prompt("Nhập phản hồi của bạn:");
    if (replyContent?.trim()) {
      handleSubmit(commentId, replyContent);
    }
  };

  // Render Helpers
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const { page, totalPages } = pagination;
    const pagesToShow: (number | string)[] = [];

    if (totalPages <= 7) {
      pagesToShow.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
    } else {
      pagesToShow.push(1);
      if (page > 3) pagesToShow.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pagesToShow.push(i);
      }

      if (page < totalPages - 2) pagesToShow.push("...");
      pagesToShow.push(totalPages);
    }

    return (
      <div className="flex justify-center items-center gap-1 mt-6 flex-wrap">
        <button
          onClick={() => fetchComments(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Trước
        </button>

        {pagesToShow.map((pageNum, idx) =>
          pageNum === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => fetchComments(pageNum as number)}
              className={`px-3 py-1 rounded transition ${
                page === pageNum
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              {pageNum}
            </button>
          )
        )}

        <button
          onClick={() => fetchComments(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Sau
        </button>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="mx-auto w-full p-6 mt-8 bg-gray-900 rounded-xl shadow-lg">
        <CommentSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full p-4 md:p-6 mt-8 bg-gray-900 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">💬</span>
          Bình luận <span className="text-blue-400">({pagination.total})</span>
        </h3>
        {error && (
          <div className="text-sm text-red-400 bg-red-900/30 px-3 py-1 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <textarea
          className="w-full bg-gray-900 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder={
            isAuthenticated
              ? "Viết bình luận của bạn..."
              : "Đăng nhập để bình luận"
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting || !isAuthenticated}
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-3">
          <div className="text-sm text-gray-400">
            {newComment.length}/1000 ký tự
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setNewComment("")}
              className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition"
              disabled={submitting || !newComment.trim()}
            >
              Hủy
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={submitting || !isAuthenticated || !newComment.trim()}
              className={`px-4 py-2 rounded font-medium transition ${
                submitting || !isAuthenticated || !newComment.trim()
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                "Gửi bình luận"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onLike={(id) => handleLikeDislike(id, "like")}
              onDislike={(id) => handleLikeDislike(id, "dislike")}
              onReply={handleReply}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-lg">Chưa có bình luận nào</p>
          <p className="text-sm mt-2">Hãy là người đầu tiên bình luận!</p>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Stats */}
      {flattenedComments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-400">
          <p>Hiển thị {flattenedComments.length} bình luận</p>
        </div>
      )}
    </div>
  );
}
