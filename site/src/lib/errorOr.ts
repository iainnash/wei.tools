export function errorOr<T = string>(stmt: () => T, onError?: T): T | undefined {
	try {
		return stmt();
	} catch (err: any) {
		console.error('handled', err);
		return onError;
	}
}
