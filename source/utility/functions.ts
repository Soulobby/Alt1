import type { ColortTriplet } from "alt1/ocr";

export function isEqualColourTriplet(colour1: ColortTriplet, colour2: ColortTriplet) {
	return colour1[0] === colour2[0] && colour1[1] === colour2[1] && colour1[2] === colour2[2];
}
