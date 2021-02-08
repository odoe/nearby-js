import Point from '@arcgis/core/geometry/Point';
import Locator from '@arcgis/core/tasks/Locator';
import { geocodeURL, maxLocations } from '../config';
import { LatLon } from '../interfaces';
import { categoryForFoodType } from '../utils/iconType';

const geocoder = new Locator({ url: geocodeURL });

/**
 * Use the Locator to search for nearby places
 * with a given lat lon and categories
 */
export const findNearbyPlaces = async (latLon: LatLon, categories: string[]) => {
	const { latitude, longitude } = latLon;
	const point = new Point({ longitude, latitude });

	const results = await geocoder.addressToLocations({
		address: undefined,
		location: point,
		categories,
		maxLocations,
		outFields: ['Place_addr', 'PlaceName', 'Phone', 'URL', 'Type'],
	});

	return (
		results
			// do a client side filter of results
			// for example, Pizza is a sub-category of Food,
			// but user may want to filter Pizza results out
			.filter((result) => {
				const type = result.attributes.Type;
				const category = categoryForFoodType(type);
				return categories.indexOf(category) > -1;
			})
			.map((result) => {
				return {
					...result.toJSON(),
					location: {
						latitude: result.location.latitude,
						longitude: result.location.longitude,
					},
				};
			})
	);
};
