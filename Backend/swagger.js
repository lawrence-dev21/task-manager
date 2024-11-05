
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Manager API',
            version: '1.0.0',
            description: 'Task Manager API documentation',
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
        ],
    },
    apis: ['./index.js'],
};

const swaggerDocs = swaggerJSDoc(options);
const swaggerDocsUI = (app) => {
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
}

module.exports = swaggerDocsUI;
