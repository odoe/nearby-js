import DirectionsViewModel from '@arcgis/core/widgets/Directions/DirectionsViewModel';

import { appId, portalUrl } from '../config';
import { initialize } from './oauth';

import { RouteDirectionsProps } from '../interfaces';

const directionsVM = new DirectionsViewModel();

/**
 * Get the directions from a start location and a stop location
 * @param param
 */
export const getDirections = async ({ start, stop, view }: RouteDirectionsProps) => {
	// set up authentication if it is valid
	initialize(appId as string, portalUrl);
	directionsVM.view = view;
	// loading the directions view model will require
	// being logged in to your application
	await (directionsVM as any).load();
	directionsVM.stops.removeAll();
	directionsVM.stops.addMany([start, stop]);
	// find the 'Walking Time' travel mode of the widget
	const walkingTravelMode = directionsVM.travelModes.find((mode) => mode.name === 'Walking Time');
	if (walkingTravelMode) {
		(directionsVM as any).selectedTravelMode = walkingTravelMode;
	}
	const routeResult = await directionsVM.getDirections();
	return (routeResult as any).routeResults[0] as __esri.RouteResult;
};

export const clearDirections = () => {
	directionsVM.reset();
};
