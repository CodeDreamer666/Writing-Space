import { useEffect, useState } from "react";

export default function useTimeAgo(createdAt: Date) {
    const [timeAgo, setTimeAgo] = useState("");

    useEffect(() => {
        function updateTimeAgo() {
            const now = new Date();

            const seconds = Math.floor(
                (now.getTime() - createdAt.getTime()) / 1000
            );

            if (seconds < 60) {
                setTimeAgo(`${seconds}s`);
                return;
            }

            const minutes = Math.floor(seconds / 60);

            if (minutes < 60) {
                setTimeAgo(`${minutes}m`);
                return;
            }

            const hours = Math.floor(minutes / 60);

            if (hours < 24) {
                setTimeAgo(`${hours}h`);
                return;
            }

            const days = Math.floor(hours / 24);

            if (days < 7) {
                setTimeAgo(`${days}d`);
                return;
            }

            const weeks = Math.floor(days / 7);

            if (weeks < 4) {
                setTimeAgo(`${weeks}w`);
                return;
            }

            const months = Math.floor(days / 30);

            if (months < 12) {
                setTimeAgo(`${months}mo`);
                return;
            }

            const years = Math.floor(days / 365);

            setTimeAgo(`${years}y`);
        }

        updateTimeAgo();

        const interval = setInterval(updateTimeAgo, 1000);

        return () => clearInterval(interval);

    }, [createdAt]);

    return timeAgo;
}