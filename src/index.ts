import { render } from 'preact';
import { html } from 'htm/preact';

import { App } from './components/App';
import AppContextProvider from './contexts/AppContext';

import './index.css';

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/service-worker.js')
			.then((registration) => {
				console.log('SW registered: ', registration);
			})
			.catch((registrationError) => {
				console.log('SW registration failed: ', registrationError);
			});
	});
}

render(
	html`
	<${AppContextProvider}>
		<${App} />
	</${AppContextProvider}>
`,
	document.body,
);
