import { useEffect, useRef } from 'preact/hooks';
import { html } from 'htm/preact';

import useWebMap from '../hooks/useWebMap';

export const WebMapView = ({ small }: { small: boolean }) => {
	const mapRef = useRef<HTMLDivElement>(null);
	const [, setContainer] = useWebMap(mapRef.current as HTMLDivElement);

	useEffect(() => {
		setContainer(mapRef.current as HTMLDivElement);
	}, [mapRef.current]);

	return html` <div class="${small ? 'w-2/3' : 'w-full'} mt-12" ref=${mapRef}></div> `;
};
