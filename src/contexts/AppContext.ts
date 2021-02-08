import { createContext } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { html } from 'htm/preact';

// hooks
import useGeolocation from '../hooks/useGeolocation';
import useNearby from '../hooks/useNearby';

import { isDay } from '../utils/dateUtil';

import { Category, LatLon, NearbyItem, State } from '../interfaces';

const defaultCategories: Category[] = [
	{
		name: 'Coffee Shop',
		selected: true,
	},
	{
		name: 'Food',
		selected: true,
	},
	{
		name: 'Pizza',
		selected: true,
	},
	{
		name: 'Hotel',
		selected: true,
	},
];

export const AppContext = createContext<State>({
	items: [],
	position: [],
	isDayTime: isDay(new Date()),
	selectItem: (a: NearbyItem) => {},
	updatePosition: (xs: number[]) => {},
});

const validPosition = ([x, y]: number[]) => Math.abs(x) > 0 && Math.abs(y) > 0;

const AppContextProvider = (props: any) => {
	const [items, setItems] = useState<NearbyItem[]>([]);
	const [selectedItem, setSelectedItem] = useState<Partial<NearbyItem> | null>(null);
	const [position, setPosition] = useState<number[]>([]);

	const updateItems = (xs: any) => setItems(xs);

	const [latLon, locate] = useGeolocation();
	const [nearbyItems, fetchNearbyItems] = useNearby(latLon as LatLon, defaultCategories);

	const selectItem = (item: NearbyItem) => setSelectedItem(item);
	const updatePosition = (ns: number[]) => setPosition(ns);

	useEffect(() => {
		fetchNearbyItems(latLon as LatLon, defaultCategories);
		const { latitude, longitude } = latLon as LatLon;
		updatePosition([longitude, latitude]);
	}, [latLon]);

	useEffect(() => {
		updateItems(nearbyItems);
	}, [nearbyItems]);

	useEffect(() => {
		if (validPosition(position)) {
			fetchNearbyItems(
				{
					latitude: position[0],
					longitude: position[1],
				},
				defaultCategories,
			);
		}
	}, [position]);

	const value = {
		items,
		selectedItem,
		position,
		isDayTime: isDay(new Date()),
		// methods
		updateItems,
		updatePosition,
		selectItem,
	};

	return html`
            <${AppContext.Provider} value=${value}>
                ${props.children}
            </${AppContext.Provider}>
        `;
};

export default AppContextProvider;
