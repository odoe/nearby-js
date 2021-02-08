import { useEffect, useRef } from 'preact/hooks';
import { html } from 'htm/preact';

import useWebMap from '../hooks/useWebMap';

export const WebMapView = () => {
	const mapRef = useRef<HTMLDivElement>(null);
	const [, setContainer] = useWebMap(mapRef.current as HTMLDivElement);

	useEffect(() => {
		setContainer(mapRef.current as HTMLDivElement);
	}, [mapRef.current]);

	return html` <div class="w-2/3 mt-12" ref=${mapRef}></div> `;
};
