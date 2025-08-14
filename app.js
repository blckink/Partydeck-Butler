const log = (msg) => {
  const el = document.getElementById('log');
  el.textContent += `${msg}\n`;
};

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function fetchAppId(name) {
  const url =
    'https://cors.isomorphic-git.org/https://store.steampowered.com/api/storesearch/?term=' +
    encodeURIComponent(name) +
    '&l=english&cc=us';
  const res = await fetch(url);
  const data = await res.json();
  return data.items && data.items.length ? data.items[0].id.toString() : null;
}

async function fetchPCGW(name) {
  const query = encodeURIComponent(`_pageName="${name}"`);
  const url =
    'https://www.pcgamingwiki.com/w/api.php?action=cargoquery&tables=infobox_game&fields=_pageName,Engine&limit=1&where=' +
    query +
    '&format=json&origin=*';
  const res = await fetch(url);
  const json = await res.json();
  if (json.cargoquery && json.cargoquery.length) {
    return json.cargoquery[0].title;
  }
  return {};
}

async function fetchIcon(appId) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
  await img.decode();
  const size = Math.min(img.width, img.height);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const sx = (img.width - size) / 2;
  const sy = (img.height - size) / 2;
  ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function buildHandler(opts) {
  return {
    'handler.uid': slugify(opts.name),
    'handler.name': opts.name,
    'handler.author': 'Partydeck Butler',
    'handler.version': '1',
    'handler.info': 'Generated automatically',
    'game.symlink_dir': true,
    'game.win': opts.platform === 'windows',
    'game.32bit': false,
    'game.exec': opts.exec,
    'game.args': ['-windowed'],
    'game.runtime': null,
    'game.copy_instead_paths': [opts.exec],
    'game.remove_paths': [],
    'game.dll_overrides': {},
    'steam.api_path': opts.steamApiPath,
    'steam.appid': opts.appId,
    'steam.gb_coldclient': false,
    'profiles.unique_appdata': opts.engine === 'Unity',
    'profiles.unique_documents': opts.engine && opts.engine.startsWith('Unreal'),
    'profiles.unique_localshare': false,
    'profiles.unique_config': false,
    'profiles.game_paths': []
  };
}

async function generate() {
  const name = document.getElementById('game-name').value.trim();
  if (!name) {
    alert('Enter a game name');
    return;
  }
  const platform = document.getElementById('platform').value;
  log(`Searching Steam for "${name}"...`);
  const appId = await fetchAppId(name);
  if (!appId) {
    log('AppID not found.');
    return;
  }
  log(`AppID: ${appId}`);
  const pcgw = await fetchPCGW(name);
  const engine = pcgw.Engine || '';
  log(`Engine: ${engine}`);
  const opts = {
    name,
    platform,
    engine,
    appId,
    exec: '',
    steamApiPath:
      engine === 'Unity'
        ? `${name}_Data/Plugins/x86_64`
        : engine && engine.startsWith('Unreal')
        ? 'Engine/Binaries/ThirdParty/Steamworks/Steamv153/redistributable_bin/win64'
        : ''
  };
  const handler = buildHandler(opts);
  const zip = new JSZip();
  zip.file('handler.json', JSON.stringify(handler, null, 2));
  const icon = await fetchIcon(appId);
  zip.file('icon.png', icon);
  const blob = await zip.generateAsync({ type: 'blob' });
  const slug = slugify(name);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slug}.pdh`;
  a.click();
}

document.getElementById('generate').addEventListener('click', generate);
