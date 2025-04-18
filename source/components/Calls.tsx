import type React from "react";
import { useEffect, useRef, useState } from "react";
import CountdownTimer from "./CountdownTimer";

enum CallType {
	SoulObelisk = 0,
	CorruptedScarabs = 1,
	DailyCat = 2,
	CorruptedEgg = 3,
}

enum CallLocation {
	Merchant = 0,
	EasternMerchant = 1,
	WesternMerchant = 2,
	Imperial = 3,
	Worker = 4,
	Port = 5,
	EasternPort = 6,
	WesternPort = 7,
	SouthernSophanem = 8,
	NorthernSophanem = 9,
}

const CallLocationToString = {
	[CallLocation.Merchant]: "Merchant",
	[CallLocation.EasternMerchant]: "Eastern Merchant",
	[CallLocation.WesternMerchant]: "Western Merchant",
	[CallLocation.Imperial]: "Imperial",
	[CallLocation.Worker]: "Worker",
	[CallLocation.Port]: "Port",
	[CallLocation.EasternPort]: "Eastern Port",
	[CallLocation.WesternPort]: "Western Port",
	[CallLocation.SouthernSophanem]: "Southern Sophanem",
	[CallLocation.NorthernSophanem]: "Northern Sophanem",
} as const satisfies Readonly<Record<CallLocation, string>>;

interface Call {
	world: number;
	type: CallType;
	location: CallLocation;
	created_at: number;
	expires_at: number;
}

function filterActiveCalls(callsData: Call[]) {
	const now = Date.now();

	return callsData
		.filter((call) => call.expires_at > now)
		.sort((a, b) => a.expires_at - b.expires_at);
}

const Calls: React.FC = () => {
	const [calls, setCalls] = useState<Call[] | null>(null);
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		const eventSource = new EventSource("https://api.soulobby.com/calls/server-sent-events");

		eventSource.onerror = (error) => {
			console.error(error);

			// Attempt to reconnect.
			setTimeout(() => {
				eventSource.close();
			}, 5000);
		};

		eventSource.addEventListener("connected", (event: MessageEvent) => {
			const data = JSON.parse(event.data) as Call[];
			setCalls(filterActiveCalls(data));
		});

		eventSource.addEventListener("update", (event: MessageEvent) => {
			const data = JSON.parse(event.data) as Call[];
			setCalls(filterActiveCalls(data));
		});

		if (timerRef.current !== null) {
			window.clearInterval(timerRef.current);
		}

		timerRef.current = window.setInterval(() => {
			setCalls((currentCalls) => {
				if (!currentCalls) {
					return null;
				}

				const filteredCalls = filterActiveCalls(currentCalls);
				return filteredCalls.length !== currentCalls.length ? filteredCalls : currentCalls;
			});
		}, 1000);

		return () => {
			eventSource.close();
			if (timerRef.current !== null) {
				window.clearInterval(timerRef.current);
			}
		};
	}, []);

	return (
		<div className="calls-container">
			{calls === null ? (
				<p className="text-center text-sm">Loading calls!</p>
			) : calls.length > 0 ? (
				<div className="calls-list">
					{calls.map((call) => (
						<div key={call.world} className="flex justify-between items-center text-xs p-1">
							<div>
								<span className="mr-1">{call.world}</span>
								<span>
									{call.type === CallType.SoulObelisk
										? CallLocationToString[call.location]
										: "Scarabs"}
								</span>
							</div>
							<CountdownTimer expiresAt={call.expires_at} />
						</div>
					))}
				</div>
			) : (
				<p className="text-center text-sm text-gray-500">No calls.</p>
			)}
		</div>
	);
};

export default Calls;
