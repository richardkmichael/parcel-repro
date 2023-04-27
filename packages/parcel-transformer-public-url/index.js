// const util = require('node:util');

const plugin = require('@parcel/plugin');
const Transformer = plugin.Transformer;

const CONFIG_FILE = 'public_url.config.json';

//  const diagnostic = require('@parcel/diagnostic');
//  const md = diagnostic.md;

function environmentVariableToPropertyName(environmentVariable) {
  return environmentVariable.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

module.exports = new Transformer({
  async loadConfig({config}) {

    let defaultContents = { publicUrl: "." };
    let loadedConfig = await config.getConfig([CONFIG_FILE]);
    return loadedConfig?.contents || defaultContents;

//  try {
//    let { contents } = await config.getConfig(['public_url.config.json']);
//    return contents;
//  } catch (e) {
//    if ( e instanceof TypeError) {
//      return defaultContents;
//    }
//  }

  },
  async transform(opts) {

    const configValue = (_, environmentVariable) => {
      // console.log(`Determining value for ${environmentVariable}`);

      // Parcel loads .env, which likely holds REACT_APP_* variables.
      // FIXME: Parcel doesn't support dynamic property access on `process.env`; load the file manually?
      // if (process.env[environmentVariable]) {
      //   console.log(`Found: ${environmentVariable} in process.env`);
      //   return process.env[environmentVariable];
      // }

      // If the config file uses camelCase keys, transform it:
      //  let propertyName = environmentVariableToPropertyName(environmentVariable);
      //  console.log(`Replacing: ${environmentVariable} with ${propertyName}`);
      //  return opts.config[propertyName];

      // If the config file uses environment variable style keys, use it directly:
      return opts.config[environmentVariable];
    }

    let asset = opts.asset;
//  console.log('transform() opts: ', util.inspect(opts));
//  console.log('transform() opts.config: ', util.inspect(opts.config));

    // FIXME: Raise if not HTML?  This transformer is only for HTML.  parcelrc should ensure that?
    if (asset.type === 'html') {
      let html = await asset.getCode();
      let publicUrl = opts.config.publicUrl;

      html = html.replace(/%([A-Z_]+)%/g, configValue);
      asset.setCode(html);

    // NODE_OPTIONS=--inspect-brk
    // debugger;
    }

    return [asset];
  }
});
