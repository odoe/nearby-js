import { Polyline } from '@arcgis/core/geometry';
import { geodesicLength } from '@arcgis/core/geometry/geometryEngine';

import { bearings } from './bearings';
import { iconType } from './iconType';

import { LatLon, NearbyItem } from '../interfaces';

/**
 * Calculate the distance between two points
 * @param pointA
 * @param pointB
 */
export const distanceBetweenTwoPoints = (pointA: LatLon, pointB: LatLon) => {
	const line = new Polyline({
		paths: [
			[pointA.longitude, pointA.latitude],
			[pointB.longitude, pointB.latitude],
		] as any,
	});

	return geodesicLength(line, 'miles');
};

/**
 * Convert AddressCandidate to a NearbyItem
 * for use in application
 * @param latLon
 */
export const asNearByItem = (latLon: LatLon) => (candidate: __esri.AddressCandidate, idx?: number) => {
	const { attributes, location } = candidate;
	const item: NearbyItem = {
		OBJECTID: `${idx}`,
		address: attributes.Place_addr,
		name: attributes.PlaceName,
		phone: attributes.Phone,
		url: attributes.URL,
		type: attributes.Type,
		location: {
			x: location.longitude,
			y: location.latitude,
		},
		bearing: bearings(latLon.latitude, latLon.longitude, location.latitude, location.longitude),
		distance: distanceBetweenTwoPoints(
			{ latitude: latLon.latitude, longitude: latLon.longitude },
			{ latitude: location.latitude, longitude: location.longitude },
		),
		icon: iconType(attributes.Type),
	};
	return item;
};
