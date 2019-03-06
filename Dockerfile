FROM node:8
# The base node image sets a very verbose log level.
ENV NPM_CONFIG_LOGLEVEL warn
WORKDIR /frontend/c3s-magic-frontend/
COPY . /frontend/c3s-magic-frontend/

RUN npm install --silent
#RUN npm run clean
RUN npm run build
# Install `serve` to run the application.
RUN npm install -g serve
# Set the command to start the node server.
CMD echo "const config = { 'backendHost': '${BACKEND}', 'adagucServicesHost': '${COMPUTE}',  'adagucViewerURL' : '${VIEWER}', 'staticWMS' : '${STATICWMS}', 'dataURL' : '${DATAURL}' };" > /frontend/c3s-magic-frontend/dist/config.js && serve -s dist --listen 80

EXPOSE 80

#docker build -t c3s-magic-frontend .
#docker run -e COMPUTE="https://compute:9000" -e BACKEND="https://portal.c3s-magic.eu/backend" -e VIEWER=https://portal.c3s-magic.eu/adaguc-viewer -e "STATICWMS=https://portal.c3s-magic.eu/backend/wms" -e "DATAURL=https://portal-dev.c3s-magic.eu/" -p 8080:80 -it c3s-magic-frontend

