import { getProtoMessages, loadProtos } from './load.proto.js';

const initServer = async () => {
  await loadProtos();
  //console.log(Object.keys(getProtoMessages()));
};

export default initServer;
