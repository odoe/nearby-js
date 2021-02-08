import { useEffect, useState } from 'preact/hooks';

import { LatLon } from '../interfaces';

/**
 * Hook to determine current geolocation
 */
const useGeolocation = () => {
	const [state, setState] = useState<LatLon>({
		latitude: 0,
		longitude: 0,
	});

	const locate = () => {
		// If geolocation not supported in the
		// browser, set lat/lon to 0
		// will be handled in application context
		if (!('geolocation' in navigator)) {
			setState({ latitude: 0, longitude: 0 });
			return;
		}
		navigator.geolocation.getCurrentPosition(({ coords }) => {
			const { latitude, longitude } = coords;
			setState({ latitude, longitude });
		});
	};

	useEffect(() => {
		locate();
	}, []);

	return [state, locate];
};

export default useGeolocation;
