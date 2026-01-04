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
  const [fetching, setFetching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // trạng thái load thêm
  const [page, setPage] = useState(1); // trang hiện tại
  const [hasMore, setHasMore] = useState(true); // còn dữ liệu để load thêm không

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;

  const LIMIT = 5; // Số comment mỗi lần load

  useEffect(() => {
    if (comments && comments.length > 0) return;

    const fetchComments = async () => {
      try {
        setFetching(true);
        const query = movieId
          ? `/comment/root?movieId=${movieId}&page=1&limit=${LIMIT}`
          : `/comment/root?page=1&limit=${LIMIT}`;

        const res = await api.get(query);
        const data: IComment[] = res.data.data.comments || [];

        setCommentList(data);
        setHasMore(data.length === LIMIT); // Nếu trả về đủ LIMIT thì còn có thể có thêm
        setPage(1);

        console.log("Fetched initial comments:", data);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        setCommentList([]);
      } finally {
        setFetching(false);
      }
    };

    fetchComments();
  }, [comments, movieId]);

  const loadMoreComments = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const query = movieId
        ? `/comment/root?movieId=${movieId}&page=${nextPage}&limit=${LIMIT}`
        : `/comment/root?page=${nextPage}&limit=${LIMIT}`;

      const res = await api.get(query);
      const newComments: IComment[] = res.data.data.comments || [];

      setCommentList((prev) => [...prev, ...newComments]);
      setHasMore(newComments.length === LIMIT); // Kiểm tra còn dữ liệu không
      setPage(nextPage);

      console.log("Loaded more comments:", newComments);
    } catch (error) {
      console.error("Failed to load more comments:", error);
    } finally {
      setLoadingMore(false);
    }
  };

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
      setCommentList((prev) => [createdComment, ...prev]);
      setNewComment("");

      // Reset về trang 1 nếu cần
      setPage(1);
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg">
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

      {/* Load more button */}
      {!fetching && hasMore && commentList.length > 0 && (
        <div className="text-center mt-4">
          <button
            onClick={loadMoreComments}
            disabled={loadingMore}
            className="px-6 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 disabled:opacity-50"
          >
            {loadingMore ? "Đang tải..." : "Xem thêm bình luận"}
          </button>
        </div>
      )}

      {/* Thông báo hết comment */}
      {!fetching && !hasMore && commentList.length > 0 && (
        <div className="text-center py-4 text-gray-400 dark:text-gray-500">
          Đã hiển thị tất cả bình luận
        </div>
      )}
    </div>
  );
}
