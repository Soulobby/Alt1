import type React from "react";
import { useEffect, useState, useCallback } from "react";

interface Overview {
	aminishi_gem_trader: number | null;
	gullible_tourist: -1 | number[] | null;
	riddler_crab: number | null;
	tuai_leit_gem_trader: number | null;
	last_updated: string;
}

const Overview: React.FC = () => {
	const [overview, setOverview] = useState<Overview | null>(null);
	const [error, setError] = useState<boolean>(false);

	const fetchOverview = useCallback(async () => {
		try {
			const response = await fetch("https://api.soulobby.com/overview");
			const data = await response.json();
			setOverview(data);
		} catch (error) {
			console.error(error);
			setError(true);
		}
	}, []);

	useEffect(() => {
		fetchOverview();
		const overviewInterval = setInterval(fetchOverview, 60000);
		return () => clearInterval(overviewInterval);
	}, [fetchOverview]);

	return (
		<div className="mt-6">
			{overview ? (
				<div className="grid grid-cols-2 gap-4">
					<div className="p-2 bg-blue-500 border border-blue-600 shadow rounded-md">
						<div className="flex justify-between items-center">
							<span className="text-yellow-400 font-medium w-full">Aminishi Gem Trader</span>
						</div>
						<p className="mt-2 text-sm">
							{overview.aminishi_gem_trader === -1
								? "None"
								: overview.aminishi_gem_trader ?? "Unknown"}
						</p>
					</div>
					<div className="p-2 bg-blue-500 border border-blue-600 shadow rounded-md">
						<div className="flex justify-between items-center">
							<span className="text-yellow-400 font-medium w-full">Gullible Tourist</span>
						</div>
						<p className="mt-2 text-sm">
							{overview.gullible_tourist === -1
								? "None"
								: overview.gullible_tourist?.join(" | ") ?? "Unknown"}
						</p>
					</div>
					<div className="p-2 bg-blue-500 border border-blue-600 shadow rounded-md">
						<div className="flex justify-between items-center">
							<span className="text-yellow-400 font-medium w-full">Riddler Crab</span>
						</div>
						<p className="mt-2 text-sm">
							{overview.riddler_crab === -1 ? "None" : overview.riddler_crab ?? "Unknown"}
						</p>
					</div>
					<div className="p-2 bg-blue-500 border border-blue-600 shadow rounded-md">
						<div className="flex justify-between items-center">
							<span className="text-yellow-400 font-medium w-full">Tuai Leit Gem Trader</span>
						</div>
						<p className="mt-2 text-sm">
							{overview.tuai_leit_gem_trader === -1
								? "None"
								: overview.tuai_leit_gem_trader ?? "Unknown"}
						</p>
					</div>
				</div>
			) : error ? (
				<div className="mt-6">
					<p className="text-center">There was an error. Best report this!</p>
				</div>
			) : (
				<p className="text-center">Loading overview!</p>
			)}
		</div>
	);
};

export default Overview;
