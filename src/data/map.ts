import { once, when, whenFalseOnce, whenOnce, whenTrueOnce } from '@arcgis/core/core/watchUtils';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Locate from '@arcgis/core/widgets/Locate';
import ViewPoint from '@arcgis/core/Viewpoint';

import { verifyUserSignedIn } from '../utils/credentials';
import { isDay } from '../utils/dateUtil';
import { nearbyLayer } from './layers';

import { NearbyItem, UpdateExtentChangeProps } from '../interfaces';

const vtUrlDay =
	'https://www.arcgis.com/sharing/rest/content/items/63c47b7177f946b49902c24129b87252/resources/styles/root.json';
const vtUrlNight =
	'https://www.arcgis.com/sharing/rest/content/items/86f556a2d1fd468181855a35e344567f/resources/styles/root.json';

const url = isDay(new Date()) ? vtUrlDay : vtUrlNight;

const baseVectorTileLayer = new VectorTileLayer({ url });

const currentItems: string[] = [];

const nearbyItemMappedAsKey = (item: NearbyItem, idx: number) => `${item.name}-${item.address}-${idx}`;

let viewPoint: __esri.Viewpoint;
const mapLoaded = false;
let popActionListening = false;

const createArcGISMap = () => {
	return new ArcGISMap({
		basemap: {
			baseLayers: [baseVectorTileLayer],
		},
		layers: [nearbyLayer],
	});
};

export const webmap = createArcGISMap();

const app = {
	map: webmap,
	center: [-116.5, 33.8],
	scale: 25000,
	ui: {
		components: ['attribution', 'zoom', 'compass'],
	},
	popup: {
		collapseEnabled: false,
		actions: [],
	},
};

const locate = new Locate();

const createMapView = () => {
	return new MapView(app);
};

export let view = createMapView();

export const listenForPopupActions = (
	updateCurrentRoute: (a: {
		currentRoute: {
			name: string;
			directions: __esri.DirectionsFeatureSet;
		};
		showDirections: boolean;
	}) => void,
) => {
	if (popActionListening) {
		return;
	}
	view.popup.on('trigger-action', async ({ action }) => {
		// only handle directions action
		if (action.id !== 'directions') {
			return;
		}
		if (!verifyUserSignedIn()) {
			return alert('Please Sign In to use Directions');
		}
		const routing = await import('./routing');
		const route = await routing.getDirections({
			// clone the graphics
			// so originals are not modified
			start: locate?.graphic.clone(),
			stop: view.popup.selectedFeature.clone(),
			view,
		});
		if (route) {
			const { directions } = route;
			updateCurrentRoute({
				currentRoute: {
					directions,
					name: view.popup.selectedFeature.attributes.name,
				},
				showDirections: true,
			});
		}
	});
	popActionListening = true;
};

/**
 * Assigns the container element to the View
 * This is where we initialize the JSPAI Locate
 * widget as well.
 * @param container
 */
export const initialize = async (container: HTMLDivElement) => {
	view = createMapView();

	locate.view = view;
	view.ui.add({
		component: locate,
		position: 'top-left',
		index: 1,
	});

	if (viewPoint) {
		view.viewpoint = ViewPoint.fromJSON(viewPoint);
	}
	view.container = container;

	if (!viewPoint) {
		if (locate.viewModel.state === 'disabled') {
			const handle = when(locate, 'viewModel.state', async (state) => {
				if (state === 'ready') {
					handle.remove();
					locate.locate();
				}
			});
		} else if (locate.viewModel.state === 'ready') {
			locate.locate();
		}
	}

	return view;
};

/**
 * This will remove all handlers and
 * save the viewpoint of the map view
 * to reuse later
 */
export const cleanup = () => {
	viewPoint = view.viewpoint.toJSON();
	// view.set('container', null);
};

/**
 * Wil add the new places into the FeatureLayer
 * @param items
 */
export const addLocations = async (items: NearbyItem[]) => {
	// verify we are only updating new items
	if (currentItems.length) {
		const incomingItems = items.map(nearbyItemMappedAsKey);
		if (
			currentItems.every((item, idx) => {
				return item === incomingItems[idx];
			})
		) {
			return;
		}
	}
	// empty the current items
	currentItems.length = 0;

	// Create the features that will be added to
	// the nearby layer
	const addFeatures = items.map((item, idx) => {
		currentItems.push(nearbyItemMappedAsKey(item, idx));
		return {
			attributes: item,
			geometry: {
				type: 'point',
				x: item.location.x,
				y: item.location.y,
			},
		} as any;
	});
	// remove the old features from the layer at the same time
	const oids = await nearbyLayer.queryObjectIds();
	const deleteFeatures = oids.map((oid) => ({ objectId: oid }));
	await nearbyLayer.applyEdits({
		deleteFeatures,
		addFeatures,
	});
	// close popup when new nearby items are added/removed
	view.popup.close();
};

/**
 * Query the item from the Layer
 * @param item
 */

export const queryNearbyItems: (item: NearbyItem) => Promise<__esri.Graphic[]> = async (item) => {
	console.log(item);
	if (!item || !(item.name && item.address)) return [];
	if (!view.ready) {
		await whenOnce(view, 'ready');
	}
	const layerView = (await view.whenLayerView(nearbyLayer)) as __esri.FeatureLayerView;
	if (layerView.updating) {
		await whenFalseOnce(layerView, 'updating');
	}
	const query = nearbyLayer.createQuery();
	// Query by Object ID field
	// query.objectIds = [ Number(item.OBJECTID) ];
	query.where = `address='${item.address}' AND name='${item.name.replace("'", "''")}'`;
	try {
		const { features } = await layerView.queryFeatures(query);
		return features;
	} catch (error) {
		return [];
	}
};

/**
 * open the popup
 * and zoom to that feature
 * @param features
 */
export const selectNearbyItems = async (features: __esri.Graphic[]) => {
	if (!features.length) {
		return;
	}
	if (!view.ready) {
		await whenOnce(view, 'ready');
	}
	view.popup.open({
		location: features[0].geometry,
		features,
	});
	return view.goTo(features);
};

/**
 * Check if it is day or night
 * and update the basemap as needed
 * @param isDayTime
 */
export const updateBasemapMode = (isDayTime: boolean) => {
	const style = isDayTime ? vtUrlDay : vtUrlNight;
	// verify that that the layer is loaded
	// and the style is currently different
	if (baseVectorTileLayer.loaded && baseVectorTileLayer.currentStyleInfo.styleUrl !== style) {
		const color = isDayTime ? 'black' : 'white';
		baseVectorTileLayer.loadStyle(style);
		updateNearbyLayerSymbols(color as any);
	}
};

/**
 * Update the color of symbols
 * Used as part of checking if
 * it is day or night mode
 * @param color
 */
export const updateNearbyLayerSymbols = (color: __esri.Color) => {
	const renderer = (nearbyLayer.renderer as __esri.UniqueValueRenderer).clone();
	// update the color of the symbols in the renderer
	renderer.uniqueValueInfos.forEach((info) => {
		(info.symbol as __esri.SimpleMarkerSymbol).color = color;
	});
	nearbyLayer.renderer = renderer;
};

export const updateMapPosition = (center: number[]) => {
	view?.goTo({ center }).catch((err) => console.warn(err.message));
};

/**
 * Watch for the extent to change and when it does
 * display a message to allow the user to search the area
 * again for new places
 * @param update
 */
export const watchExtentChange = async (update: (a: UpdateExtentChangeProps) => void) => {
	await once(view, 'extent');
	const { latitude, longitude } = view.center;
	update({
		currentPosition: {
			type: 'point',
			latitude,
			longitude,
		},
	});

	await whenTrueOnce(view, 'stationary');
	// only want the notification to show
	// if the map has already been loaded
	// and the map is currently displayed
	if (view && view.center) {
		const isReady = mapLoaded && !!view.container;
		const props: UpdateExtentChangeProps = {
			showNotification: isReady,
			currentPosition: {
				type: 'point',
				latitude: view.center.latitude,
				longitude: view.center.longitude,
			},
		};
		update(props);
	}

	watchExtentChange(update);
};
