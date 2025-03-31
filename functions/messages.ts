interface Env {
	API_TOKEN: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	try {
		return await fetch("https://api.soulobby.com/messages", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.API_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(await request.json()),
		});
	} catch (error) {
		console.error(error);
		return Response.json({ message: "Internal server error." }, { status: 500 });
	}
};
