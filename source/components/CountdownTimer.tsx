import type React from "react";
import { useEffect, useRef, useState } from "react";

function formatTimeLeft(expiresAt: string) {
	const timeRemaining = Date.parse(expiresAt) - Date.now();

	if (timeRemaining <= 0) {
		return "Expired";
	}

	const totalSeconds = Math.floor(timeRemaining / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface CountdownTimerProps {
	expiresAt: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiresAt }) => {
	const [timeLeft, setTimeLeft] = useState<string | null>(null);
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		setTimeLeft(formatTimeLeft(expiresAt));

		timerRef.current = window.setInterval(() => {
			setTimeLeft(formatTimeLeft(expiresAt));
		}, 1000);

		return () => {
			if (timerRef.current !== null) {
				window.clearInterval(timerRef.current);
			}
		};
	}, [expiresAt]);

	return <p className="italic">{timeLeft ?? ""}</p>;
};

export default CountdownTimer;
