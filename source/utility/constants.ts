export const LINE_REGULAR_EXPRESSION =
	/(?<time>^\[\d{2}(?::|;)\d{2}(?::|;)\d{2}\]) \[(?<fc>[a-zA-Z ]+)\] .*?(?<name>[\w -]{1,12}): (?<message>.+)$/;

export enum TabType {
	Calls = 0,
	Overview = 1,
}
