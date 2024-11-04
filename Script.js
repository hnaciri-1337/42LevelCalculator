import axios from "axios";
import fs from 'fs/promises';

var accessToken = null;
var projectsInformations = [];

const updateToken = async () => {
  try {
    const res = await axios.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'client_credentials',
      client_id: '',
      client_secret: '',
    });
    accessToken = res.data.access_token;
  } catch (err) {
    console.log('Error fetching access token:', err);
  }
};

const fetchData = async (index) => {
  try {
    if (!accessToken)
      await updateToken();
    const res = await axios.get(`https://api.intra.42.fr/v2/cursus/21/projects?page[number]=${index.toString()}&page[size]=100`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (err) {
    console.log('Error fetching data:', err);
    return [];
  }
};

const fetchDataUntilEmpty = async () => {
  let pageIndex = 1;
  let newData = await fetchData(pageIndex);

  while (newData.length > 0) {
    projectsInformations = [...projectsInformations, ...newData];
    pageIndex++;
    newData = await fetchData(pageIndex);
  }

  projectsInformations = projectsInformations
    .filter(({ name, difficulty }) => difficulty !== null && difficulty !== 0 && difficulty !== undefined)
    .map(({ id, name, difficulty }) => ({ id, name, difficulty }));

  try {
    await fs.writeFile('projectsInformation.json', JSON.stringify(projectsInformations, null, 2));
    console.log('Data saved to projectsInformation.json');
  } catch (err) {
    console.error('Error writing to file:', err);
  }
};

fetchDataUntilEmpty();
