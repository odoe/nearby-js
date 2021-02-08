import { useContext } from 'preact/hooks';
import { html } from 'htm/preact';

import { NavBar } from './NavBar';
import { NearbyCard } from './NearbyCard';
import { AppContext } from '../contexts/AppContext';
import { WebMapView } from './WebMapView';

import useMediaQuery from '../hooks/useMediaQuery';

export const App = () => {
	const { items, selectedItem } = useContext(AppContext);
	const nearbyItems = items.map((item) => html`<${NearbyCard} ...${item} />`);

	const isSmallScreen = useMediaQuery('(max-width: 600px)');
	const showMap = (isSmall: boolean) => {
		if (isSmall) {
			return [];
		} else {
			return html`<${WebMapView} small=${isSmall} />`;
		}
	};

	const listOrMap = (itemSelected: boolean) => {
		if (isSmallScreen && itemSelected) {
			const props = { small: isSmallScreen };
			return html`<${WebMapView} props=${props} />`;
		} else {
			return html` <div class=${listClasses(isSmallScreen)}>
					<ul class="list-reset">
						${nearbyItems}
					</ul>
				</div>
				${showMap(isSmallScreen)}`;
		}
	};

	const listClasses = (isSmall: boolean) => {
		if (isSmall) {
			return 'w-full mt-12 overflow-y-auto';
		} else {
			return 'w-1/3 mt-12 overflow-y-auto';
		}
	};

	return html`
		<div id="root" class="flex">
			<${NavBar} />
			<!-- App Container -->
			<div class="h-full w-full flex flex-row">
				<!-- List Container -->
				<div class="h-full w-full flex flex-row">${listOrMap(Boolean(selectedItem))}</div>
			</div>
		</div>
	`;
};
