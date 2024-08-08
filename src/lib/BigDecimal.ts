// from https://stackoverflow.com/questions/16742578/bigdecimal-in-javascript modified to typescript

export class BigDecimal {
	// Configuration: private constants
	static #DECIMALS = 18; // Number of decimals on all instances
	static #ROUNDED = true; // Numbers are truncated (false) or rounded (true)
	static #SHIFT = BigInt('1' + '0'.repeat(BigDecimal.#DECIMALS)); // Derived constant
	static #fromBigInt = Symbol(); // Secret to allow construction with given #n value
	#n: bigint; // the BigInt that will hold the BigDecimal's value multiplied by #SHIFT
	constructor(value: bigint | BigDecimal | string, convert?: Symbol) {
		if (value instanceof BigDecimal) {
			this.#n = value.#n;
			return value;
		}
		if (convert === BigDecimal.#fromBigInt) {
			// Can only be used within this class
			this.#n = BigInt(value);
			return;
		}
		const [ints, decis] = String(value).split('.').concat('');
		this.#n =
			BigInt(ints + decis.padEnd(BigDecimal.#DECIMALS, '0').slice(0, BigDecimal.#DECIMALS)) +
			BigInt(BigDecimal.#ROUNDED && decis[BigDecimal.#DECIMALS] >= '5');
	}
	add(num: string | bigint) {
		return new BigDecimal(this.#n + new BigDecimal(num).#n, BigDecimal.#fromBigInt);
	}
	subtract(num: string | bigint) {
		return new BigDecimal(this.#n - new BigDecimal(num).#n, BigDecimal.#fromBigInt);
	}
	static #divRound(dividend: bigint, divisor: bigint) {
		return new BigDecimal(
			dividend / divisor + (BigDecimal.#ROUNDED ? ((dividend * 2n) / divisor) % 2n : 0n),
			BigDecimal.#fromBigInt
		);
	}
	multiply(num: string | bigint) {
		return BigDecimal.#divRound(this.#n * new BigDecimal(num).#n, BigDecimal.#SHIFT);
	}
	divide(num: string | bigint) {
		return BigDecimal.#divRound(this.#n * BigDecimal.#SHIFT, new BigDecimal(num).#n);
	}
	toString() {
		let s = this.#n
			.toString()
			.replace('-', '')
			.padStart(BigDecimal.#DECIMALS + 1, '0');
		s = (s.slice(0, -BigDecimal.#DECIMALS) + '.' + s.slice(-BigDecimal.#DECIMALS)).replace(
			/(\.0*|0+)$/,
			''
		);
		return this.#n < 0 ? '-' + s : s;
	}
}
