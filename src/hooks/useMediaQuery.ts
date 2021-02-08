import { useEffect, useState } from 'preact/hooks';

/**
 * Hook to determine media query of page
 */
const useMediaQuery = (query: string) => {
	const mqList = window.matchMedia(query);
	const [state, setState] = useState<boolean>(!!mqList.matches);

	const handler = () => {
		setState(mqList.matches);
	};

	useEffect(() => {
		setState(mqList.matches);
		mqList.addEventListener('change', handler);
		return () => {
			mqList.removeEventListener('change', handler);
		};
	}, [query]);

	return state;
};

export default useMediaQuery;
