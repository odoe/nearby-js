import { render } from 'preact';
import { html } from 'htm/preact';

import { App } from './components/App';
import AppContextProvider from './contexts/AppContext';

import './index.css';

render(
	html`
	<${AppContextProvider}>
		<${App} />
	</${AppContextProvider}>
`,
	document.body,
);
