import axios from 'axios';

const callDatas = axios.get(
  'https://cdn.rawgit.com/akabab/superhero-api/0.2.0/api/all.json'
);

export default callDatas;
