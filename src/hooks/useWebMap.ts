import { useContext, useEffect, useState } from 'preact/hooks';
import { NearbyCard } from '../components/NearbyCard';

import { AppContext } from '../contexts/AppContext';
import { NearbyItem } from '../interfaces';

type useWebMapResponse = [HTMLDivElement, (a: HTMLDivElement) => void];

/**
 * Hook to manage creation of map and communication
 * with application context
 * @param element
 */
const useWebMap = (element: HTMLDivElement): useWebMapResponse => {
	const [container, setContainer] = useState<HTMLDivElement>(element);
	const { isDayTime, items, position, selectedItem } = useContext(AppContext);

	let cleanup: () => void;
	const loadMap = async () => {
		const app = await import('../data/map');
		app.initialize(container);
		// app.listenForLocate(setState);
		// app.listenForPopupActions(setState);
		cleanup = app.cleanup;
		// app.watchExtentChange(setState);
	};

	const addItemsToMap = async () => {
		const app = await import('../data/map');
		await app.addLocations(items);
	};

	const updateBasemap = async () => {
		const app = await import('../data/map');
		app.updateBasemapMode(isDayTime);
	};

	const updateMapCenter = async (center: number[]) => {
		const app = await import('../data/map');
		app.updateMapPosition(center);
	};

	const selectItems = async (nearbyItem: NearbyItem) => {
		const { selectNearbyItems, queryNearbyItems } = await import('../data/map');
		const features = await queryNearbyItems(nearbyItem);
		await selectNearbyItems(features);
	};

	// load the map when the map
	// container is updated
	// from switching routes
	useEffect(() => {
		if (container) {
			loadMap();
		}
		return () => {
			if (cleanup) {
				cleanup();
			}
		};
	}, [container]);

	useEffect(() => {
		// add new items to the
		// map layer as they are
		// updated
		addItemsToMap();
	}, [items]);

	// sync map center
	// with device position
	useEffect(() => {
		updateMapCenter(position);
	}, [position]);

	useEffect(() => {
		selectItems(selectedItem as NearbyItem);
	}, [selectedItem]);

	useEffect(() => {
		// if time changes from day to night
		// or vice versa, update basemap style
		updateBasemap();
	}, [isDayTime]);

	return [container, setContainer];
};

export default useWebMap;
