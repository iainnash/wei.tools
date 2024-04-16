export function errorOr<T = string>(stmt: () => T, onError: T) {
	try {
		return stmt();
	} catch (err: any) {
		return onError;
	}
}
