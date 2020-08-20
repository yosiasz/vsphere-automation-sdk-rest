import App from './app';
import HostsController from './hosts/hosts.controller';
import VirtsController from './virts/virts.controller';
import ClustersController from './clusters/clusters.controller';
import DatacentersController from './datacenters/datacenters.controller'
import FoldersController from './folders/folders.controller'
import AuthController from './auth/auth.controller'

const app = new App(
  [
    new HostsController(),
    new VirtsController(),
    new ClustersController(),
    new DatacentersController(),
    new FoldersController(),
    new AuthController()
  ],
  5000,
);
 
app.listen();