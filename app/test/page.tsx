"use client";
import CommentList from "@/components/movie/CommentList";
import Player from "@/components/movie/Player";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import ImageKit from "@/components/ui/Image";

const TestPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="p-4 w-60 aspect-3/4">
      {/* <CommentList /> */}
      <ImageKit
        w={500}
        h={500}
        path="movie-website/poster/one-punch-man-sesson-1.jpg"
      />
      <img
        src="https://ik.imagekit.io/tudxtwork524/movie-website/poster/one-punch-man-season-1.jpg"
        alt=""
      />
    </div>
  );
};

export default TestPage;
