"use client";
import React, { startTransition, useEffect, useState } from "react";
import api from "@/lib/api";
import { IComment } from "@/types/response.type";
import useAuthStore from "@/stores/auth.store";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Share2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  User,
  Heart,
  Flame,
} from "lucide-react";
import Image from "next/image";

const PAGE_SIZE = 5;

export default function CommentItem({
  comment,
  level = 0,
}: {
  comment: IComment;
  level?: number;
}) {
  const [replies, setReplies] = useState<IComment[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const user = useAuthStore((state) => state.user);

  // Counts
  const [likeCount, setLikeCount] = useState(comment.totalLike || 0);
  const [dislikeCount, setDislikeCount] = useState(comment.totalDislike || 0);
  const [usefulCount, setUsefulCount] = useState(comment.totalUseful || 0);
  const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
  // User reactions
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(
    null
  );
  const [userUseful, setUserUseful] = useState(false);

  // Format time
  const formattedTime = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: vi,
      })
    : "Vừa xong";

  useEffect(() => {
    if (!user) return;
    if (comment.likes?.includes(user._id)) {
      console.log("User liked this comment", user._id, comment.likes);
      setUserReaction("like");
    } else if (comment.dislikes?.includes(user._id)) {
      console.log("User disliked this comment", user._id, comment.dislikes);
      setUserReaction("dislike");
    }
  }, [comment, user]);

  const loadReplies = async (id: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.get(`/comment/replies/${id}`, {
        params: { page: Math.ceil(loaded / PAGE_SIZE) + 1, limit: PAGE_SIZE },
      });
      const data: IComment[] = res.data.data.comments;
      setReplies((prev) => [...prev, ...data]);
      setLoaded((prev) => prev + data.length);
    } catch (error) {
      console.error("Failed to load replies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReplies = async () => {
    setOpen((prev) => !prev);
    if (!open && loaded === 0) {
      await loadReplies(comment.id);
    }
  };

  const handleReaction = async (reaction: "like" | "dislike") => {
    if (!user || reactionLoading) return;
    setReactionLoading(true);
    try {
      const res = await api.post(`/comment/react/${comment.id}`, {
        type: reaction,
      });
      const updatedComment: IComment = res.data;

      // Update counts + user state
      setLikeCount(updatedComment.totalLike || 0);
      setDislikeCount(updatedComment.totalDislike || 0);

      if (
        Array.isArray(updatedComment.likes) &&
        updatedComment.likes.includes(user._id)
      )
        setUserReaction("like");
      else if (
        Array.isArray(updatedComment.dislikes) &&
        updatedComment.dislikes.includes(user._id)
      )
        setUserReaction("dislike");
      else setUserReaction(null);
    } catch (error) {
      console.error("Failed to react:", error);
    } finally {
      setReactionLoading(false);
    }
  };

  const handleUseful = async () => {
    if (!user) return;
    try {
      const res = await api.post(`/comments/${comment.id}/useful`);
      const updatedComment: IComment = res.data;
      setUsefulCount(updatedComment.totalUseful || 0);
      setUserUseful(updatedComment.useful?.includes(user._id) || false);
    } catch (error) {
      console.error("Failed to mark useful:", error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/comment/comment-${comment.id}`
      );
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  const handleReplySubmit = async () => {
    if (!user || !replyContent.trim()) return;
    setReplyLoading(true);
    try {
      const res = await api.post("/comment", {
        content: replyContent,
        parentId: comment.id,
        userId: user._id,
      });
      const newReply: IComment = res.data.data;
      setReplies((prev) => [newReply, ...prev]);
      setReplyCount((prev) => prev + 1);
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setReplyLoading(false);
    }
  };
  const isMaxLevel = level >= 3;

  return (
    <div
      id={`comment-${comment.id}`}
      className={`mt-3 ${isMaxLevel ? "ml-0" : ""}`}
      style={{
        marginLeft: isMaxLevel ? 0 : level * 24,
      }}
    >
      {/* Comment Container */}
      <div
        className={`relative p-4 rounded-2xl transition-all duration-200 ${
          level === 0
            ? "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md"
            : "bg-gray-50/50 dark:bg-gray-800/50"
        }`}
      >
        {/* Vertical line for nested comments */}
        {!isMaxLevel && level > 0 && (
          <div className="absolute left-[-12px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-900"></div>
        )}

        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              {comment.user?.avatar ? (
                <img
                  src={comment.user.avatar}
                  alt={comment.user.displayName || ""}
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                  // width={40}
                  // height={40}
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-white dark:border-gray-700">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              {/* {comment.user?.role === "admin" && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs text-white font-bold">A</span>
                </div>
              )} */}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-2 text-sm">
              {/* Tên người dùng */}
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                {comment.user?.displayName || "Người dùng ẩn danh"}
              </h4>

              {/* Verified */}
              {/* {comment.user?.verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300">
                  ✓ Đã xác thực
                </span>
              )} */}

              {/* Thời gian */}
              <span className="text-gray-500 dark:text-gray-400">
                {formattedTime}
              </span>

              {/* Tên phim */}
              {comment.movieName && (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full">
                  {comment.movieName}
                </span>
              )}

              {/* Tập hoặc label */}
              {comment.episodeOrLabel && (
                <span className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded-full text-xs min-w-8 text-center">
                  {comment.episodeOrLabel}
                </span>
              )}
            </div>

            {/* Comment Text */}
            <div className="">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed wrap-break-word">
                {comment.content}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center -ml-2">
              {/* Like Button - Xanh khi đã like */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction("like");
                }}
                disabled={reactionLoading || !user}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                  userReaction === "like"
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 dark:border-blue-700 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent"
                } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ThumbsUp
                  className={`w-4 h-4 ${
                    userReaction === "like"
                      ? "text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400"
                      : ""
                  }`}
                />
                <span
                  className={`font-medium ${
                    userReaction === "like"
                      ? "text-blue-700 dark:text-blue-300"
                      : ""
                  }`}
                >
                  {likeCount}
                </span>
              </button>

              {/* Dislike Button - Xanh khi đã dislike */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction("dislike");
                }}
                disabled={reactionLoading || !user}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                  userReaction === "dislike"
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 dark:border-blue-700 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent"
                } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ThumbsDown
                  className={`w-4 h-4 ${
                    userReaction === "dislike"
                      ? "text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400"
                      : ""
                  }`}
                />
                <span
                  className={`font-medium ${
                    userReaction === "dislike"
                      ? "text-blue-700 dark:text-blue-300"
                      : ""
                  }`}
                >
                  {dislikeCount}
                </span>
              </button>

              {/* Useful Button - Xanh khi đã useful */}
              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseful();
                }}
                disabled={!user}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                  userUseful
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 dark:border-blue-700 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent"
                } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {userUseful ? (
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                ) : (
                  <Lightbulb className="w-4 h-4" />
                )}
                <span
                  className={`font-medium ${
                    userUseful ? "text-blue-700 dark:text-blue-300" : ""
                  }`}
                >
                  Hữu ích
                </span>
                {usefulCount > 0 && (
                  <span
                    className={`ml-1 ${
                      userUseful ? "text-blue-600 dark:text-blue-400" : ""
                    }`}
                  >
                    ({usefulCount})
                  </span>
                )}
              </button> */}

              {/* Share Button */}
              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                  shareSuccess
                    ? "bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent"
                }`}
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-600 dark:text-green-400">
                      Đã copy
                    </span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Chia sẻ</span>
                  </>
                )}
              </button>

              {/* Replies Toggle - Xanh khi mở */}
              {comment.replyCount !== undefined && comment.replyCount > 0 && (
                <button
                  onClick={handleToggleReplies}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                    open
                      ? "bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 dark:border-blue-700 shadow-sm"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span
                    className={`font-medium ${
                      open ? "text-blue-700 dark:text-blue-300" : ""
                    }`}
                  >
                    {open ? "Ẩn phản hồi" : `${replyCount} phản hồi`}
                  </span>
                  {open ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                onClick={() => setShowReplyForm((prev) => !prev)}
                disabled={!user}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent ${
                  !user ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Reply</span>
              </button>
            </div>
            {showReplyForm && (
              <div className="mt-3">
                <textarea
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  rows={3}
                  placeholder="Viết phản hồi..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={replyLoading}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    disabled={replyLoading}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleReplySubmit}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                    disabled={replyLoading || !replyContent.trim()}
                  >
                    {replyLoading ? "Đang gửi..." : "Gửi"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-4 ml-13 flex items-center justify-center">
            <div className="relative">
              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <span className="ml-2 text-sm text-gray-500">
              Đang tải phản hồi...
            </span>
          </div>
        )}
      </div>

      {/* Replies Section */}
      {open && replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={isMaxLevel ? level : level + 1}
            />
          ))}

          {/* Load More Replies */}
          {comment.replyCount !== undefined && loaded < comment.replyCount && (
            <div className="flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadReplies(comment.id);
                }}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all ${
                  loading
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-50 text-blue-600 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Xem thêm phản hồi ({loaded}/{comment.replyCount})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
