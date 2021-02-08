import { html } from 'htm/preact';
import { useContext } from 'preact/hooks';
import { AppContext } from '../contexts/AppContext';
import { svgSymbolMap } from '../utils/symbols';

import { NearbyItem } from '../interfaces';

export const NearbyCard = (props: NearbyItem) => {
	const { selectItem } = useContext(AppContext);

	const onClick = () => {
		selectItem(props);
	};

	const { address, icon, name, bearing, distance } = props;
	const svgPath = svgSymbolMap[icon];

	return html`
		<li class="cursor-pointer content-center p-4 m-1 border-solid border-2 border-gray-500" onclick="${onClick}">
			<div class="flex items-center">
				<div class="flex-shrink-0 h-10 w-10">
					<svg class="fill-current text-gray-500" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
						<path d=${svgPath} />
					</svg>
				</div>
				<div class="ml-4">
					<div class="text-sm font-medium text-gray-900">${name}</div>
					<div class="text-sm text-gray-500">${address}</div>
				</div>
				<div class="ml-auto">
					<div class="text-sm font-medium text-gray-900">${bearing}</div>
					<div class="text-sm text-gray-500">${distance.toFixed(2)}m</div>
				</div>
			</div>
		</li>
	`;
};
