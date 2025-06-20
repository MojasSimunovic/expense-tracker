/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as echarts from 'echarts';
import * as zrender from 'zrender';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

echarts.registerTheme('light', {
  color: [
    '#FF7043',
    '#42A5F5',
    '#EC407A',
    '#AB47BC',
    '#FF80AB',
    '#66BB6A',
    '#FFEB3B',
  ],
});

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
