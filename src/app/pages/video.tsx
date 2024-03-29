import PremiumCard from "@/components/premium";
import { supabase } from "@/lib/supabase";
import React, { useCallback, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { STABLEDIFFUSION_URL } from "../../config/api";
import { toast } from "react-toastify";
import ProgressBar from "@/components/progress";
interface Chat {
  type: string;
  content: string;
}

const VideoAI = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [videoHistory, setVideoHistory] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const STABLEDDIFFUISION_TOKEN = process.env.NEXT_PUBLIC_STABLEDIFFUSION_API;

  const getContent = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);

    const userQuery = { type: "question", content: searchQuery };
    setVideoHistory((prev) => [...prev, userQuery]);

    const data = {
      key: STABLEDDIFFUISION_TOKEN,
      prompt: searchQuery,
      negative_prompt: "",
      scheduler: "LCMScheduler",
      seconds: 2,
    };

    try {
      const videoKeyResponse = await axios.post(STABLEDIFFUSION_URL, data);
      if (videoKeyResponse.data.status == "processing") {
        const fetchURL = videoKeyResponse.data.fetch_result;
        setTimeout(async () => {
          await getVideoFunc(fetchURL);
        }, 10000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getVideoFunc = async (url: string) => {
    try {
      const data = {
        key: STABLEDDIFFUISION_TOKEN,
      };
      const videoResponse = await axios.post(url, data);

      if (videoResponse.data.status === "processing") {
        setTimeout(async () => {
          await getVideoFunc(url);
        }, 10000);
      }

      if (videoResponse.data.status === "success") {
        const { error } = await supabase.from("chat_activities").insert({
          title: "Video Inquiry",
          iconpath: "/path/to/video-icon.svg",
          time: new Date().toISOString(),
          description: searchQuery,
        });
        console.log(error);

        setVideoHistory((prev) => [
          ...prev,
          {
            type: "answer",
            content: videoResponse.data.output[0],
          },
        ]);

        setSearchQuery("");
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div className="w-full pt-4">
      {videoHistory.length > 0 ? (
        videoHistory.map((item, key) => (
          <div
            key={key}
            className={`ml-4 md:ml-16 ${
              key === videoHistory.length - 1 ? "pb-20" : ""
            }`}
          >
            <div className="flex items-center">
              <Image
                className="text-left mb-4 mt-4 pr-4"
                src={item.type == "question" ? "/me.png" : "/agai.png"}
                height={30}
                width={30}
                alt=""
              />
              {item.type == "question" ? "Me" : "Agai"}
            </div>
            {item.type == "question" ? (
              <p className="text-[16px] text-justify pr-8  mb-4 pl-8">
                {item.content}
              </p>
            ) : (
              <video
                className="pl-8"
                id="myVideo"
                width="640"
                height="360"
                controls
              >
                <source src={item.content} type="video/mp4" />
              </video>
            )}
            {loading && key === videoHistory.length - 1 && (
              <>
                <ProgressBar time={120} />
              </>
            )}
          </div>
        ))
      ) : (
        <div>
          <Image
            className="m-auto mt-32"
            src={"/logo.svg"}
            height={200}
            width={200}
            alt=""
          />
          <h2 className="text-center text-2xl">How can we help you?</h2>
        </div>
      )}
      <div
        className={` md:max-w-[60%] ml-[2%] md:ml-[10%]  m-x-auto flex search-btn text-left fixed bottom-5 w-[96%] md:w-3/4`}
      >
        <input
          className="inline-block md:p-[14px] bg-transparent text-[14px] search-txt w-full"
          type="text"
          name="text"
          placeholder="What are you looking for?"
          onChange={(e: any) => setSearchQuery(e.target.value)}
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !loading) {
              getContent();
            }
          }}
        />
        <div className="inline-block float-right cursor-pointer">
          {loading ? (
            <button className="send-btn">Loading ...</button>
          ) : (
            <button
              className="send-btn flex items-center p-[15px]"
              onClick={() => getContent()}
            >
              <svg
                width="25"
                height="24"
                viewBox="0 0 25 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.5698 8.50989L10.0098 4.22989C4.25978 1.34989 1.89978 3.70989 4.77978 9.45989L5.64978 11.1999C5.89978 11.7099 5.89978 12.2999 5.64978 12.8099L4.77978 14.5399C1.89978 20.2899 4.24978 22.6499 10.0098 19.7699L18.5698 15.4899C22.4098 13.5699 22.4098 10.4299 18.5698 8.50989ZM15.3398 12.7499H9.93977C9.52978 12.7499 9.18977 12.4099 9.18977 11.9999C9.18977 11.5899 9.52978 11.2499 9.93977 11.2499H15.3398C15.7498 11.2499 16.0898 11.5899 16.0898 11.9999C16.0898 12.4099 15.7498 12.7499 15.3398 12.7499Z"
                  fill="white"
                />
              </svg>
              {!loading ? "Send" : "Loading..."}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoAI;
