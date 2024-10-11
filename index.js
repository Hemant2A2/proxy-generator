const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const proxyServer = "https://sslproxies.org/";
const api = "https://develop.roblox.com/v1/assets?assetIds=";
const cookie =
  ".ROBLOSECURITY=_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_23C11514C2DD7E1993B23350F9CE530E46E0B21DA51D834127F9387293542E9DADC4DDDE583915A526A461F9B1EE68EE1346ADABE51D65AC8E9C7E4C95D4EB1EF0224F0818600654C3E01F23205D3A26D8FDE8870048EE539CE333899F3E96B50CF61AAE2D57CA04433A8C98B8FAB80B8EA50F692BF708B4923AC748AC42F3273C0FBCEB43679E3FFD80A32B134BABCED453E64B542C18E7817FABB1A09BA22822AA57B513599EEF88EDF6BA00A473B7A6E43369B71BEA5DFBB11ECC98CDF099CAE448F739612CC20FD5A55A396746C128ED8700EEC446B82616F6A074CF52DF79C23DE75A06D54B8FDAB3106BEBAA57E8A59E1B882C0D017C0CD0E5E6269CBB5B78D5F866FF8FCF16FBB2931FE4D1A9E331B3DF78CC4CAA2241EDEB0D3867B7E59CA1E507807EA7ED85AA9316CB8BEDCB9F18E898D96924BE3D9E9352C41CFF0FC17479CD9EDB7258992430CFD28C1B1B4AE0E4F5671D996B1ACC0BEA994E42F92226B207FB0BFCD0D63DE141D3B2BBC63D8304779DE09AF2AE854B6BE117F596726DDAFF5D5118E359AFF0787F08AEB0D15EA1C203224E40F237B4614F66AAC2B27059A9FB918D83149C7550D6180C0AE26B04F1B11FDBFB3F93204AB7A1A55A9F3F6EE7D8F63B1C907E8870344D8F85D3A4562934EA44846E1D76B0DF912A56E0289791E1A3B14BF3F627447757ABEFCD7351C992BCFA28D6C9A2592A39E0B40EA0F56E76354A07DF5321E245C48979ADA7F8748824D615AB2D0CEF50745701E0A0387E52E8A0364DDF2C342C940ADF9D7E2377F4F33D84028818DDAC30F4D2EFCFDAA4944DBB63AE73CE8F0CF47DEBA98C39369D751A0FEA19649C86303848A9584A0E84011A1F695904D4DA55C6E762FA266E6EDC973111F510BE2AC3B965D4ECCA454AF8C6B8AEB2CD71FBB65ADB8538FED7A3D90AEF65C2EA3429BC067D8413790D54F278E59D37DA9DFE87F02B7EA48743B8A7B8C1862E3A51277DBA35AE3D48B48015D44CDDDCB94BE755A5EA71CD57873012080D5691361F062835A040BCC80ACD85DC4E4AF6BC72B065638D70672211C5080296093B4994D6555DF6C29696AC5D57F34796E9EE5D5C992B82D71A55";

//function to extract the ip addresses
const proxyGenerator = async () => {
  let ip_addresses = [];
  let port_numbers = [];

  await axios
    .get(proxyServer)
    .then((response) => {
      const $ = cheerio.load(response.data);

      $("td:nth-child(1)").each(function (index, value) {
        ip_addresses[index] = $(this).text();
      });

      $("td:nth-child(2)").each(function (index, value) {
        port_numbers[index] = $(this).text();
      });
      ip_addresses.join(", ");
      port_numbers.join(", ");
    })
    .catch((error) => {
      console.log(error);
    });

  let random_number = Math.floor(Math.random() * 100);
  return {
    protocol: "http",
    host: `${ip_addresses[random_number]}`,
    port: `${port_numbers[random_number]}`,
  };
};

//function to fetch data from roblox
async function performScraping(cycle) {
  let proxy_agent;
  (async () => {
    proxy_agent = await proxyGenerator();
    let data = `${cycle}->${proxy_agent.host}\n`;
    fs.appendFile("cycle.txt", data, "utf8", (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      }
    });
  })();

  let startingAsset = 1800 + cycle * 50;
  let assetString = "";
  for (let i = startingAsset; i < startingAsset + 50; i++) {
    assetString = assetString + `${i},`;
  }

  const res = await axios.get(`${api}${assetString}`, {
    proxy: proxy_agent,
    headers: {
      cookie: cookie,
    },
  });
  if (res.status === 200) {
    let targetId = [];
    for (let i = 0; i < 50; i++) {
      targetId.push(res.data.data[i].creator.targetId);
      let data = `${res.data.data[i].creator.targetId}\n`;
      fs.appendFile("id.txt", data, "utf8", (err) => {
        if (err) {
          console.error("Error writing to file:", err);
        }
      });
    }
    return targetId;
  }
  return "error";
}

(async () => {
  let creatersLogged = [];
  const total_cycles = 100;
  //for each cycle 49 assests are fetched
  for (let cycle = 0; cycle < total_cycles; cycle++) {
    const result = await performScraping(cycle);

    creatersLogged += result;
  }
})();
