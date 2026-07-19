'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::first-visit.first-visit');
