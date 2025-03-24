import ChatBoxReader from "alt1/chatbox";
import type { ColortTriplet } from "alt1/ocr";
import type React from "react";
import { useEffect, useState } from "react";
import { LINE_REGULAR_EXPRESSION } from "./utility/constants";
import { isEqualColourTriplet } from "./utility/functions";
import Overview from "./components/overview";

interface Message {
	player_name: string;
	message: string;
	created_at: number;
}

const App: React.FC = () => {
	const [isAlt1Detected] = useState<boolean>(!!window.alt1);

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
						// Ensure there are a minimum number of fragments.
						if (option.fragments.length < 5) {
							continue;
						}

						const lineResult = LINE_REGULAR_EXPRESSION.exec(option.text);

						if (lineResult?.groups) {
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
							const [hours, minutes, seconds] = time.slice(1, -1).split(":");
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
				setTimeout(monitor, 100);
			}
		};

		monitor();
	};

	return (
		<div className="p-4">
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-blue-500">Soulobby</h1>
					{isAlt1Detected ? (
						<p className="mt-2 text-lg">"Just keep this open! ~"</p>
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
					<Overview />
				</div>
			</div>
			<div className="fixed bottom-4 right-4 flex space-x-2">
				<a
					href="https://discord.gg/tucxgUNzZ4"
					target="_blank"
					rel="noopener noreferrer"
					className="social-icon"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="16"
						width="16"
						stroke="currentColor"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<title>Discord</title>
						<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
					</svg>
				</a>
				<a
					aria-label="GitHub"
					href="https://github.com/Soulobby/Alt1"
					target="_blank"
					rel="external noopener noreferrer"
					className="social-icon"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="16"
						width="16"
						stroke="currentColor"
						fill="currentColor"
						stroke-width="0"
						viewBox="0 0 16 16"
					>
						<title>GitHub</title>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M7.976 0A7.977 7.977 0 0 0 0 7.976c0 3.522 2.3 6.507 5.431 7.584.392.049.538-.196.538-.392v-1.37c-2.201.49-2.69-1.076-2.69-1.076-.343-.93-.881-1.175-.881-1.175-.734-.489.048-.489.048-.489.783.049 1.224.832 1.224.832.734 1.223 1.859.88 2.3.685.048-.538.293-.88.489-1.076-1.762-.196-3.621-.881-3.621-3.964 0-.88.293-1.566.832-2.153-.05-.147-.343-.978.098-2.055 0 0 .685-.196 2.201.832.636-.196 1.322-.245 2.007-.245s1.37.098 2.006.245c1.517-1.027 2.202-.832 2.202-.832.44 1.077.146 1.908.097 2.104a3.16 3.16 0 0 1 .832 2.153c0 3.083-1.86 3.719-3.62 3.915.293.244.538.733.538 1.467v2.202c0 .196.146.44.538.392A7.984 7.984 0 0 0 16 7.976C15.951 3.572 12.38 0 7.976 0z"
						/>
					</svg>
				</a>
			</div>
		</div>
	);
};

export default App;
