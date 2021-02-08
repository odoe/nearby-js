import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { svgSymbol, svgSymbolMap } from '../utils/symbols';

const fields: __esri.FieldProperties[] = [
	{
		name: 'OBJECTID',
		alias: 'OBJECTID',
		type: 'oid',
	},
	{
		name: 'address',
		alias: 'Address',
		type: 'string',
	},
	{
		name: 'bearing',
		alias: 'Bearing',
		type: 'string',
	},
	{
		name: 'distance',
		alias: 'Distance',
		type: 'double',
	},
	{
		name: 'icon',
		alias: 'Icon',
		type: 'string',
	},
	{
		name: 'name',
		alias: 'Name',
		type: 'string',
	},
	{
		name: 'phone',
		alias: 'Phone',
		type: 'string',
	},
	{
		name: 'url',
		alias: 'Url',
		type: 'string',
	},
	{
		name: 'type',
		alias: 'Type',
		type: 'string',
	},
];

const popupTemplate = {
	title: '{name}',
	content: ({ graphic }: __esri.Feature) => {
		const { address } = graphic.attributes;
		const ul = document.createElement('ul');
		ul.classList.add('nearby-popup-content');
		ul.innerHTML = `
            <li>${address}</li>
        `;
		return ul;
	}
};

const renderer: any = {
	type: 'unique-value',
	field: 'icon',
	symbol: svgSymbol('default'),
	uniqueValueInfos: Object.keys(svgSymbolMap).map((infoValue) => ({
		value: infoValue,
		symbol: svgSymbol(infoValue),
	})),
};

export const nearbyLayer = new FeatureLayer({
	id: 'nearby-places',
	title: 'Nearby Places',
	geometryType: 'point',
	source: [],
	fields,
	objectIdField: 'OBJECTID',
	outFields: ['*'],
	renderer,
	popupTemplate,
});
