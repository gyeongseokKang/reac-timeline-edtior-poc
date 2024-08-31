import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { FC, useEffect, useState } from "react";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import { TimelineState } from "../../interface/timeline";
import { scale, scaleWidth, startLeft } from "./mock";
export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

const TimelinePlayer: FC<{
  timelineState: React.MutableRefObject<TimelineState>;
  autoScrollWhenPlay: React.MutableRefObject<boolean>;
}> = ({ timelineState, autoScrollWhenPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!timelineState.current) return;
    const engine = timelineState.current;
    engine.listener.on("play", () => setIsPlaying(true));
    engine.listener.on("paused", () => setIsPlaying(false));
    engine.listener.on("afterSetTime", ({ time }) => setTime(time));
    engine.listener.on("setTimeByTick", ({ time }) => {
      setTime(time);

      if (autoScrollWhenPlay.current) {
        const autoScrollFrom = 500;
        const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
        timelineState.current.setScrollLeft(left);
      }
    });

    return () => {
      if (!engine) return;
      engine.pause();
      engine.listener.offAll();
    };
  }, []);

  const handlePlayOrPause = () => {
    if (!timelineState.current) return;
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    } else {
      timelineState.current.play({ autoEnd: true });
    }
  };

  const handleRateChange = (rate: number) => {
    if (!timelineState.current) return;
    timelineState.current.setPlayRate(rate);
  };

  const timeRender = (time: number) => {
    const float = (parseInt((time % 1) * 100 + "") + "").padStart(2, "0");
    const min = (parseInt(time / 60 + "") + "").padStart(2, "0");
    const second = (parseInt((time % 60) + "") + "").padStart(2, "0");
    return <>{`${min}:${second}.${float.replace("0.", "")}`}</>;
  };

  return (
    <div className="flex gap-4 w-full items-center p-4">
      <div className="play-control" onClick={handlePlayOrPause}>
        {isPlaying ? <IoMdPause size={30} /> : <IoMdPlay size={30} />}
      </div>

      <div className="rate-control">
        <Select
          onValueChange={(value) => {
            handleRateChange(parseFloat(value));
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Speed" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Speed</SelectLabel>
              {Rates.map((rate) => (
                <SelectItem key={rate} value={rate.toString()}>{`${rate.toFixed(
                  1
                )}배속`}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="time">{timeRender(time)}</div>
    </div>
  );
};

export default TimelinePlayer;
