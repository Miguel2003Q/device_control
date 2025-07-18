# DeviceControl

## Observaciones
- En angular.json se debe poner la ruta de assets
- Router oulet?
- La fuente esta definida en index.html
- app-routing.module.ts no es necesario
- Los componentes deben estar marcados como standalone. Si no pones standalone: true, Angular no podrá compilar ese componente si no forma parte de un NgModule, y te dará error.
- Las rutas ahora se definen solo en app.routes.ts y se importan en main.ts
- Cada componente hmtl que use top-bar y sidebar se debe definir asi:
<app-top-bar></app-top-bar>
<app-sidebar></app-sidebar>

<div class="dashboard-container">
.dashboard-container {
  display: flex;
  height: calc(100vh - 60px);
  overflow: auto;
  background-color: #F8F9FA;
  margin-left: 250px;
  margin-top: 60px;
}

- Para poder ver los iconos se puso acceso global en index.html
- [routerLinkActiveOptions]="{ exact: false } Para que permanezca activo mientras se esta en una ruta hija 
- Actualizar el cache al guardar, actualiz o elim un activo
- Poner funciones del landing
- Tener en cuenta el reponsive del sidebar
- La creación de atributos entidad se asocia solo con el id
- Hacer validaciones de usuario logueado
- Ver cascades, numero de activos
- Investigar las suscripciones para entender las notifics, responsive, fechas correctas, boton ver, redirigir noti, solis de espacios para vigs esta la info
- localstorage?

## Estrucutra
- admin: Vistas del admin
- auxiliar: Componentes auxiliares
- core: Services y models
- public: Vistas públicas

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.9.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
