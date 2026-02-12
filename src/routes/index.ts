import { Router } from '@vaadin/router';
import { routes } from '@routes/app.routes';

export const router = new Router(document.querySelector('#outlet'));

router.setRoutes(routes);
