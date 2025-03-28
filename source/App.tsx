import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import ChatBoxReader from "alt1/chatbox";
import type { ColortTriplet } from "alt1/ocr";
import type React from "react";
import { useEffect, useState } from "react";
import Calls from "./components/Calls";
import Overview from "./components/Overview";
import { LINE_REGULAR_EXPRESSION, TabType } from "./utility/constants";
import { isEqualColourTriplet } from "./utility/functions";

interface Message {
	player_name: string;
	message: string;
	created_at: number;
}

const App: React.FC = () => {
	const [isAlt1Detected] = useState<boolean>(!!window.alt1);
	const [activeTab, setActiveTab] = useState<TabType>(TabType.Calls);

	useEffect(() => {
		if (window.alt1) {
			alt1.identifyAppUrl("./appconfig.json");
			startMonitoring();
		}
	}, []);

	const startMonitoring = () => {
		const reader = new ChatBoxReader();
		let latestTimestamp: number | null = null;
		let latestContent: string | null = null;
		let chatColour: ColortTriplet | null = null;

		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This is fine.
		const monitor = async () => {
			try {
				reader.find();
				const options = reader.read();

				if (options) {
					const messages: Message[] = [];

					for (const option of options) {
						const lineResult = LINE_REGULAR_EXPRESSION.exec(option.text);

						if (option.fragments.length >= 5 && lineResult?.groups) {
							const { time, fc, name, message } = lineResult.groups as {
								time: string;
								fc: string;
								name: string;
								message: string;
							};

							chatColour = option.fragments[option.fragments.length - 1]!.color;

							if (fc !== "Help Scout") {
								continue;
							}

							const content = `\`${time}\` \`${name}\`: ${message}`;
							const [hours, minutes, seconds] = time.slice(1, -1).split(/:|;/);

							const timestamp = new Date().setHours(
								Number(hours),
								Number(minutes),
								Number(seconds),
								0,
							);

							if (
								latestTimestamp &&
								(timestamp < latestTimestamp ||
									(timestamp === latestTimestamp && content === latestContent))
							) {
								continue;
							}

							latestTimestamp = timestamp;
							latestContent = content;
							messages.push({ player_name: name, message, created_at: timestamp });
						} else if (chatColour && messages.length > 0 && option.fragments.length === 1) {
							// Check to see if this is wrapped text.
							if (isEqualColourTriplet(chatColour, option.fragments[0]!.color)) {
								const lastMessage = messages[messages.length - 1]!;
								lastMessage.message += ` ${option.text}`;
							}
						}

						console.info(option);
					}

					for (const message of messages) {
						const abortController = new AbortController();
						const timeout = setTimeout(() => abortController.abort(), 5000);

						try {
							await fetch("https://api.soulobby.com/messages", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify(message),
								signal: abortController.signal,
							});
						} catch (error) {
							console.error("Failed to send message to API:", error);
						} finally {
							clearTimeout(timeout);
						}
					}
				}
			} catch (error) {
				console.error(error);
			} finally {
				setTimeout(monitor, 250);
			}
		};

		monitor();
	};

	return (
		<div className="p-4 min-h-screen flex flex-col">
			<div className="fixed top-4 right-4 flex space-x-2">
				<a
					aria-label="Discord"
					href="https://discord.gg/tucxgUNzZ4"
					target="_blank"
					rel="noopener noreferrer"
					className="social-icon"
				>
					<SiDiscord className="h-5 w-5" />
				</a>
				<a
					aria-label="GitHub"
					href="https://github.com/Soulobby/Alt1"
					target="_blank"
					rel="external noopener noreferrer"
					className="social-icon"
				>
					<SiGithub className="h-5 w-5" />
				</a>
			</div>
			{isAlt1Detected && (
				<div className="fixed top-0 left-0 right-0 z-10 bg-rs-dark border-b border-gray-700 shadow-md">
					<div className="flex max-w-md mx-auto">
						<button
							type="button"
							className={`flex-1 py-3 px-4 text-sm font-medium ${
								activeTab === TabType.Calls
									? "text-rs-accent border-b-2 border-rs-accent"
									: "text-gray-400 hover:text-gray-300"
							}`}
							onClick={() => setActiveTab(TabType.Calls)}
						>
							Calls
						</button>
						<button
							type="button"
							className={`flex-1 py-3 px-4 text-sm font-medium ${
								activeTab === TabType.Overview
									? "text-rs-accent border-b-2 border-rs-accent"
									: "text-gray-400 hover:text-gray-300"
							}`}
							onClick={() => setActiveTab(TabType.Overview)}
						>
							Overview
						</button>
					</div>
				</div>
			)}
			<div className="flex-grow flex flex-col justify-center items-center pt-14">
				<div className="text-center w-full max-w-md">
					{isAlt1Detected ? (
						<div className="tab-content">
							{activeTab === TabType.Calls ? <Calls /> : <Overview />}
						</div>
					) : (
						<div className="alt1-warning">
							<p>Alt1 not detected!</p>
							<a
								href={`alt1://addapp/${new URL("./appconfig.json", document.location.href).href}`}
								className="text-rs-accent hover:underline"
							>
								Click here to add this app to Alt1!
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default App;
