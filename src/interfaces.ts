export interface NearbyItem {
	OBJECTID: string;
	address: string;
	name: string;
	phone: string;
	url: string;
	type: string;
	location: {
		x: number;
		y: number;
	};
	bearing: string;
	distance: number;
	icon: string;
}

export interface AppPosition {
	type: string;
	latitude: number;
	longitude: number;
}

export interface Category {
	name: string;
	selected: boolean;
}

export interface DirectionsResult {
	directions: __esri.DirectionsFeatureSet;
	name: string;
}

export interface State {
	// properties
	items: NearbyItem[];
	selectedItem?: NearbyItem;
	position: number[];
	isDayTime: boolean;
	// methods
	selectItem: (a: NearbyItem) => void;
	updatePosition: (xs: number[]) => void;
}

export interface AppState {
	categories?: Category[];
	currentNearbyItem?: NearbyItem;
	currentPosition?: AppPosition;
	currentRoute?: DirectionsResult;
	hasGeolocationPermission?: boolean;
	isDayTime?: boolean;
	items?: NearbyItem[];
	mode?: string;
	mounted?: boolean;
	position?: AppPosition;
	redoSearch?: boolean;
	showFilter?: boolean;
	showDirections?: boolean;
	showNotification?: boolean;
}

export interface LatLon {
	latitude: number;
	longitude: number;
}

export interface RouteDirectionsProps {
	start: __esri.Graphic;
	stop: __esri.Graphic;
	view: __esri.MapView;
}

export interface ListenForLocateProps {
	position?: AppPosition;
	hasGeolocationPermission?: boolean;
}

export interface UpdateExtentChangeProps {
	currentPosition?: AppPosition;
	showNotification?: boolean;
}
