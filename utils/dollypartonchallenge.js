const sharp = require("sharp");
const path = require("path");
const { uuid } = require("uuidv4");

const FRAME = path.resolve("./source-images/frame.png");
const OUTPUT_PATH = path.resolve("./public/images");

const IMAGE_SIZE = 1080;
const IMAGE_SIZE_HALF = IMAGE_SIZE / 2;

const colors = {
  linkedin: "#004C78",
  facebook: "#235299",
  instagram: "#8D30A1",
  tinder: "#FF2B5E",
};

const resize = (source, key) => {
  const promiseCallback = (resolve, reject) => {
    const color = colors[key];

    const fillOptions = {
      kernel: sharp.kernel.nearest,
      fit: sharp.fit.contain,
      position: sharp.strategy.entropy,
      background: color,
    };

    sharp(source)
      .resize(IMAGE_SIZE_HALF, IMAGE_SIZE_HALF)
      .toBuffer((error, data) => {
        if (error) return reject(error);
        return resolve(data);
      });
  };
  return new Promise(promiseCallback);
};

const compose = (images, outputOptions) => {
  const promiseCallback = (resolve, reject) => {
    const [linkedin, facebook, instagram, tinder] = images;
    const { path, name } = outputOptions;
    const file = `${path}/${name}`;

    sharp(FRAME)
      .composite([
        { input: linkedin, gravity: "northwest" },
        { input: facebook, gravity: "northeast" },
        { input: instagram, gravity: "southwest" },
        { input: tinder, gravity: "southeast" },
        { input: FRAME, gravity: "center" },
      ])
      .sharpen()
      .jpeg({
        quality: 82,
        chromaSubsampling: "4:4:4",
      })
      .toFile(file, (error, info) => {
        if (error) return reject(error);
        return resolve({ ...info, path, name });
      });
  };
  return new Promise(promiseCallback);
};

const generate = (linkedin, facebook, instagram, tinder) => {
  const outputOptions = {
    path: OUTPUT_PATH,
    name: `dollypartonchallenge-${uuid()}.jpg`,
  };

  return Promise.all([
    resize(linkedin, "linkedin"),
    resize(facebook, "facebook"),
    resize(instagram, "instagram"),
    resize(tinder, "tinder"),
  ])
    .then(result => {
      return compose(result, outputOptions);
    })
    .catch(console.error);
};

module.exports = { generate };
