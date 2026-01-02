"use client";
import { IComment } from "@/types/response.type";
import CommentItem from "./CommentItem";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/auth.store";
import api from "@/lib/api";
interface CommentList {
  comment?: IComment[];
  movieId?: string;
}
export default function CommentList({
  comments,
  movieId,
  episodeOrLabel,
}: {
  comments?: IComment[];
  movieId?: string;
  episodeOrLabel?: string;
}) {
  const [commentList, setCommentList] = useState<IComment[]>(comments || []);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); // trạng thái fetch root comment

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (comments && comments.length > 0) return;
    const query = movieId
      ? `/comment/root?movieId=${movieId}` // nếu có movieId thì query theo movie
      : `/comment/root`; // nếu không có movieId thì lấy tất cả root comment

    const fetchComments = async () => {
      try {
        setFetching(true);
        const res = await api.get(query);
        const data: IComment[] = res.data.data.comments || [];
        setCommentList(data);
        console.log("Fetched comments:", data);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        setCommentList([]);
      } finally {
        setFetching(false);
      }
    };
    fetchComments();
  }, [comments]);

  const handleSubmit = async () => {
    if (!isAuthenticated || !newComment.trim()) return;

    setLoading(true);
    try {
      const res = await api.post("/comment", {
        content: newComment,
        movieId: movieId,
        episodeOrLabel: episodeOrLabel,
      });
      const createdComment: IComment = res.data.data;

      // Thêm comment mới lên đầu danh sách

      console.log("Created comment:", createdComment);
      setCommentList((prev) => [createdComment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" p-4 rounded-lg">
      {/* Comment input */}
      <textarea
        disabled={!isAuthenticated || loading}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder={
          isAuthenticated ? "Viết bình luận..." : "Đăng nhập để bình luận"
        }
        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
        rows={3}
      />

      <div className="flex justify-end mb-4">
        <button
          onClick={handleSubmit}
          disabled={!isAuthenticated || !newComment.trim() || loading}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Bình luận"}
        </button>
      </div>

      {/* Loading root comments */}
      {fetching && (
        <div className="text-center py-4 text-gray-400 dark:text-gray-500">
          Đang tải bình luận...
        </div>
      )}

      {/* Comment list */}
      {!fetching &&
        commentList.map((c) => <CommentItem key={c.id} comment={c} />)}

      {!fetching && commentList.length === 0 && (
        <div className="text-center py-4 text-gray-400 dark:text-gray-500">
          Chưa có bình luận nào.
        </div>
      )}
    </div>
  );
}
