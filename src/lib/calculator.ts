import { BigDecimal } from './BigDecimal';

const operationRegex = /(\+|\/|\*|\-|%|(bps))/g;

export function handleOperations(input: string, multipler: bigint): string | undefined {
	const mathOperations = input
		.replace(/[kK]/g, '000')
		.replace(/[mM]/g, '000000')
		.replace(/ /g, '')
		.split(/(\+|\/|\*|\-|\%|bps)/g)
		.filter((n) => n !== undefined && n.length > 0);
	console.log('mathing', mathOperations);
	let operation = '';
	let register = new BigDecimal(0n);
	for (let i = 0; i < mathOperations.length; i++) {
		if (mathOperations[i].match(operationRegex)) {
			operation = mathOperations[i];
			if (operation === 'bps') {
				register = register!.divide(10_000n);
			} else if (operation === '%') {
				register = register!.divide(100n);
			}
		} else {
			if (i === 0) {
				register = new BigDecimal(mathOperations[i]).multiply(multipler);
				continue;
			}
			console.log({ i, operation, register, op: mathOperations[i] });
			if (operation === '*') {
				register = register!.multiply(mathOperations[i]);
			}
			if (operation === '-') {
				register = register!.subtract(mathOperations[i]);
			}
			if (operation === '/') {
				register = register!.divide(mathOperations[i]);
			}
			if (operation === '+') {
				register = register!.add(mathOperations[i]);
			}
		}
	}
	console.log('register', register.toString());
	return register.toString();
}

export const hasSupportedMathOperations = (input: string) => !!input.match(operationRegex);
