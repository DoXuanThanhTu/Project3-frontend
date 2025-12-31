"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaReply,
  FaUserCircle,
  FaShare,
  FaStar,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import useAuthStore from "@/stores/auth.store";
import { IComment } from "@/types/response.type";

interface CommentSectionProps {
  movieId?: string;
  seasonOrLabel?: string;
  episode?: number;
  mediaType?: "movie" | "series";
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const MOCK_COMMENTS: IComment[] = [
  {
    id: "c1",
    content: "Phim này xem cuốn thật sự 😍",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: "u1",
      displayName: "Thanh",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    likes: ["u1"],
    dislikes: [],
    shares: [],
    useful: [],
    isEdited: false,
    isDeleted: false,
    replies: [],
  },
];

const fakeFetchComments = (
  page: number,
  limit: number
): Promise<{ items: IComment[]; total: number }> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          items: MOCK_COMMENTS.slice((page - 1) * limit, page * limit),
          total: MOCK_COMMENTS.length,
        }),
      800
    )
  );

const formatDate = (date: string) =>
  formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: vi,
  });

interface CommentItemProps {
  comment: IComment;
  depth?: number;
  isAuthenticated: boolean;
  currentUserId?: string;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onShare: (id: string) => void;
  onUseful: (id: string) => void;
  onReply: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth = 0,
  isAuthenticated,
  currentUserId,
  onLike,
  onDislike,
  onShare,
  onUseful,
  onReply,
  onEdit,
  onDelete,
}) => {
  // HOOKS PHẢI ĐƯỢC GỌI TRƯỚC MỌI ĐIỀU KIỆN
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  // Early return - nhưng hooks đã được gọi rồi
  if (comment.isDeleted) {
    return (
      <div className="text-gray-500 italic text-sm ml-6">
        Bình luận đã bị xóa
      </div>
    );
  }

  const isOwner = currentUserId === comment.user?.id;
  const isLiked = currentUserId && comment.likes.includes(currentUserId);
  const isDisliked = currentUserId && comment.dislikes.includes(currentUserId);
  const isShared = currentUserId && comment.shares.includes(currentUserId);
  const isUseful = currentUserId && comment.useful.includes(currentUserId);

  return (
    <div className={`ml-${depth * 6} py-3`}>
      <div className="flex gap-3">
        {comment.user?.avatar ? (
          <img src={comment.user.avatar} className="w-9 h-9 rounded-full" />
        ) : (
          <FaUserCircle className="text-2xl text-gray-500" />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-white">
              {comment.user?.displayName}
            </span>
            <span className="text-gray-400">
              {formatDate(comment.createdAt)}
            </span>

            {isOwner && (
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setIsEditing(true)}>
                  <FaEdit />
                </button>
                <button onClick={() => onDelete(comment.id)}>
                  <FaTrash />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-gray-800 rounded p-2 mt-2"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    onEdit(comment.id, editContent);
                    setIsEditing(false);
                  }}
                >
                  <FaCheck />
                </button>
                <button onClick={() => setIsEditing(false)}>
                  <FaTimes />
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-200 mt-1">{comment.content}</p>
          )}

          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <button
              disabled={!isAuthenticated}
              onClick={() => onLike(comment.id)}
              className={isLiked ? "text-blue-500" : ""}
            >
              <FaThumbsUp /> {comment.likes.length}
            </button>

            <button
              disabled={!isAuthenticated}
              onClick={() => onDislike(comment.id)}
              className={isDisliked ? "text-red-500" : ""}
            >
              <FaThumbsDown /> {comment.dislikes.length}
            </button>

            <button
              disabled={!isAuthenticated}
              onClick={() => onUseful(comment.id)}
              className={isUseful ? "text-yellow-500" : ""}
            >
              <FaStar /> {comment.useful.length}
            </button>

            <button
              disabled={!isAuthenticated}
              onClick={() => onShare(comment.id)}
              className={isShared ? "text-green-500" : ""}
            >
              <FaShare /> {comment.shares.length}
            </button>

            {isAuthenticated && depth < 2 && (
              <button onClick={() => onReply(comment.id)}>
                <FaReply /> Trả lời
              </button>
            )}
          </div>

          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
              onLike={onLike}
              onDislike={onDislike}
              onShare={onShare}
              onUseful={onUseful}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function CommentSection({
  mediaType = "movie",
}: CommentSectionProps) {
  const { isAuthenticated, user } = useAuthStore();

  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fakeFetchComments(1, 10);
      setComments(res.items);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      await fetchComments();
    };

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [fetchComments]);

  const toggleAction = (id: string, field: keyof IComment) => {
    if (!isAuthenticated || !user) return;

    const update = (list: IComment[]): IComment[] =>
      list.map((c) => {
        if (c.id === id) {
          const arr = c[field] as string[];
          return {
            ...c,
            [field]: arr.includes(user.id)
              ? arr.filter((i) => i !== user.id)
              : [...arr, user.id],
          };
        }
        return {
          ...c,
          replies: c.replies ? update(c.replies) : [],
        };
      });

    setComments(update);
  };

  if (loading) {
    return <div className="text-gray-400">Đang tải bình luận...</div>;
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl">
      <textarea
        disabled={!isAuthenticated}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder={
          isAuthenticated ? "Viết bình luận..." : "Đăng nhập để bình luận"
        }
        className="w-full bg-gray-800 rounded p-3 mb-4"
      />

      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          isAuthenticated={isAuthenticated}
          currentUserId={user?.id}
          onLike={(id) => toggleAction(id, "likes")}
          onDislike={(id) => toggleAction(id, "dislikes")}
          onShare={(id) => toggleAction(id, "shares")}
          onUseful={(id) => toggleAction(id, "useful")}
          onReply={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      ))}
    </div>
  );
}
