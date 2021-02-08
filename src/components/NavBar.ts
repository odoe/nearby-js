import { html } from 'htm/preact';

export const NavBar = () => {
	return html`
		<nav class="w-screen fixed flex flex-row items-center p-2 justify-between bg-blue-700 shadow-xs">
			<div class="ml-8 text-lg text-white">Nearby Places</div>
		</nav>
	`;
};
